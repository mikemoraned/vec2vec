import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count
import random


parser = argparse.ArgumentParser()
parser.add_argument("--width", type=int, help="width of grid square", default=10)
parser.add_argument("--seed", type=int, help="seed for randomisation", default=1)
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

data_directory = args.data_directory

width = args.width
height = width
seed = args.seed
logging.info(
    "using %d x %d grid, seed of %d, saving in %s", width, height, seed, data_directory
)

random.seed(seed)

logging.info("generating paths")
paths = []
for x_start in range(0, width):
    for y_start in range(0, height):
        start = "{},{}".format(x_start, y_start)
        for x_end in range(0, width):
            x_diff = x_end - x_start
            if x_diff > 1:
                x_mid = x_start + random.randrange(x_diff)
                for y_end in range(0, height):
                    y_diff = y_end - y_start
                    if y_diff > 1:
                        y_mid = y_start + random.randrange(y_diff)
                        mid = "{},{}".format(x_mid, y_mid)
                        end = "{},{}".format(x_end, y_end)
                        paths.append([start, mid, end])
logging.debug("generated {} paths".format(len(paths)))


logging.info("generating word2vec model")
model = Word2Vec(paths, min_count=0, workers=cpu_count())
logging.debug(model.wv.most_similar("0,0"))
