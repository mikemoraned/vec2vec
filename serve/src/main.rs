extern crate clap;
use clap::{App, Arg};

use std::fs::File;
use std::io::BufReader;

use finalfusion::prelude::*;
use finalfusion::similarity::Similarity;
use statistical::{mean, standard_deviation};
use std::num::ParseIntError;
use std::str::FromStr;

#[derive(Debug)]
struct GridPoint {
    x: u8,
    y: u8,
}

impl GridPoint {
    fn distance(&self, other: &GridPoint) -> f32 {
        use std::cmp::{max, min};
        let x_dist = (max(self.x, other.x) - min(self.x, other.x)) as f32;
        let y_dist = (max(self.y, other.y) - min(self.y, other.y)) as f32;
        (x_dist.powf(2.0) + y_dist.powf(2.0)).sqrt()
    }
}

impl FromStr for GridPoint {
    type Err = ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let coords: Vec<&str> = s.split(',').collect();

        let x = coords[0].parse::<u8>()?;
        let y = coords[1].parse::<u8>()?;

        Ok(GridPoint { x, y })
    }
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
        .get_matches();

    let model_path = matches.value_of("model").unwrap();

    println!("model: {}", model_path);

    let mut reader = BufReader::new(File::open(model_path).unwrap());

    let embeddings = Embeddings::read_word2vec_binary(&mut reader).unwrap();

    let mut distances = vec![];
    for word in embeddings.vocab().words() {
        let from_point = GridPoint::from_str(word).unwrap();
        match embeddings.similarity(word, 8) {
            None => println!("nothing similar found"),
            Some(sims) => {
                for word_sim in sims {
                    let to_point = GridPoint::from_str(word_sim.word).unwrap();
                    distances.push(to_point.distance(&from_point));
                }
            }
        }
    }

    let mean = mean(&distances);
    let stddev = standard_deviation(&distances, Some(mean));
    println!("mean: {}, stddev: {}", mean, stddev);
}
