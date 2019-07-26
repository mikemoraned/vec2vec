extern crate clap;
use clap::{App, Arg};

use std::fs::File;
use std::io::BufReader;

use finalfusion::prelude::*;
use finalfusion::similarity::Similarity;

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

    println!("Model, {}", model_path);

    let mut reader = BufReader::new(File::open(model_path).unwrap());

    let embeddings = Embeddings::read_word2vec_binary(&mut reader).unwrap();

    match embeddings.similarity("0,0", 8) {
        None => println!("nothing similar found"),
        Some(sims) => {
            println!("similarities");
            for word_sim in sims {
                println!(
                    "sim: {} => {}",
                    word_sim.similarity.into_inner(),
                    word_sim.word
                );
            }
        }
    };
}
