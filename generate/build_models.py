import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count
import random
import itertools


parser = argparse.ArgumentParser()
parser.add_argument(
    "--base_name", help="base name for naming inputs/outputs", required=True
)
parser.add_argument("--dimensions", type=int, help="number of dimensions", default=100)
parser.add_argument(
    "--log", help="log level", choices=["info", "debug"], default="info"
)
parser.add_argument("data_directory")
args = parser.parse_args()

log_level = args.log
numeric_log_level = getattr(logging, log_level.upper(), None)
if not isinstance(numeric_log_level, int):
    raise ValueError("Invalid log level: %s" % log_level)
logging.basicConfig(format="%(asctime)s %(message)s", level=numeric_log_level)

paths_file = "{}.paths.txt".format(args.base_name)
logging.info(
    "base_name %s, paths file %s, dimensions %d, saving in %s",
    args.base_name,
    paths_file,
    args.dimensions,
    args.data_directory,
)


class PathPerLine(object):
    def __init__(self, file):
        self.file = file

    def __iter__(self):
        for line in open(self.file):
            yield line.split()


logging.info("generating word2vec models")
model = Word2Vec(
    PathPerLine(paths_file), min_count=0, workers=cpu_count(), size=args.dimensions
)
model_path = "{}/{}.dim{}.model.bin".format(
    args.data_directory, args.base_name, args.dimensions
)
model.wv.save_word2vec_format(model_path, binary=True)
