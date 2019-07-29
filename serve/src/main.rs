extern crate clap;
use clap::{App, Arg};

use std::fs::File;
use std::io::BufReader;
use std::io::BufWriter;

use finalfusion::prelude::*;
use finalfusion::similarity::Similarity;
use indicatif::{ProgressBar, ProgressStyle};
use serde::{Deserialize, Serialize};
use statistical::{mean, standard_deviation};
use std::collections::HashSet;
use std::fmt;
use std::num::ParseIntError;
use std::str::FromStr;

#[derive(Hash, Eq, PartialEq, Debug, Serialize, Deserialize, Clone)]
struct GridPoint {
    x: u16,
    y: u16,
}

impl GridPoint {
    fn distance(&self, other: &GridPoint) -> f32 {
        (self.x_distance(other).pow(2) as f32 + self.y_distance(other).pow(2) as f32).sqrt()
    }

    fn x_distance(&self, other: &GridPoint) -> u16 {
        use std::cmp::{max, min};
        max(self.x, other.x) - min(self.x, other.x)
    }

    fn y_distance(&self, other: &GridPoint) -> u16 {
        use std::cmp::{max, min};
        max(self.y, other.y) - min(self.y, other.y)
    }

    fn is_neighbour(&self, other: &GridPoint) -> bool {
        self.x_distance(other) == 1 && self.y_distance(other) == 1
    }
}

impl FromStr for GridPoint {
    type Err = ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let coords: Vec<&str> = s.split(',').collect();

        let x = coords[0].parse::<u16>()?;
        let y = coords[1].parse::<u16>()?;

        Ok(GridPoint { x, y })
    }
}

impl fmt::Display for GridPoint {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{},{}", self.x, self.y)
    }
}

#[derive(Serialize, Deserialize)]
struct Layout {
    nodes: Vec<Node>,
    links: Vec<Link>,
}

#[derive(Serialize, Deserialize)]
struct Node {
    id: String,
    point: GridPoint,
}

#[derive(Serialize, Deserialize)]
struct Link {
    source: String,
    target: String,
    similarity: f32,
}

fn main() {
    let matches = App::new("vec2vec reader")
        .version("0.1.0")
        .author("Mike Moran")
        .arg(
            Arg::with_name("model")
                .long("model")
                .required(true)
                .help("path to word2vec model file")
                .takes_value(true),
        )
        .arg(
            Arg::with_name("layout")
                .long("layout")
                .help("path to where to output layout as json")
                .takes_value(true),
        )
        .get_matches();

    let model_path = matches.value_of("model").unwrap();

    let mut reader = BufReader::new(File::open(model_path).unwrap());

    let embeddings = Embeddings::read_word2vec_binary(&mut reader).unwrap();

    if let Some(layout_path) = matches.value_of("layout") {
        println!("layout path: {}", layout_path);
        let mut point_set = HashSet::new();
        for word in embeddings.vocab().words() {
            let point = GridPoint::from_str(word).unwrap();
            point_set.insert(point);
        }
        let mut nodes = vec![];
        for point in &point_set {
            nodes.push(Node {
                id: point.to_string(),
                point: point.clone(),
            });
        }
        let mut links = vec![];

        let max_neighbours = 8;
        let mut words = embeddings.vocab().words().to_vec();
        words.sort();
        let pb = ProgressBar::new(words.len() as u64);
        pb.set_style(ProgressStyle::default_bar());
        let mut count = 0;
        for word in words.iter() {
            pb.set_position(count);
            let from_point = GridPoint::from_str(word).unwrap();
            match embeddings.similarity(word, max_neighbours) {
                None => println!("nothing similar found"),
                Some(sims) => {
                    for word_sim in sims {
                        let to_point = GridPoint::from_str(word_sim.word).unwrap();
                        links.push(Link {
                            source: from_point.to_string(),
                            target: to_point.to_string(),
                            similarity: word_sim.similarity.into_inner(),
                        });
                    }
                }
            }
            count += 1;
        }
        let layout = Layout { nodes, links };

        let writer = BufWriter::new(File::create(layout_path).unwrap());
        let result = serde_json::to_writer_pretty(writer, &layout);
        println!("{:?}", result);
    }
}
