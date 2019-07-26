import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count
import random


parser = argparse.ArgumentParser()
parser.add_argument("--width", type=int, help="width of grid square", default=10)
parser.add_argument("--num_paths", type=int, help="number of paths to create", default=1000)
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

for path_num in range(0, args.num_paths):
    x1 = random.randrange(0, width)
    x2 = random.randrange(0, width)
    x_min = min(x1, x2)
    x_max = max(x2, x2)
    y1 = random.randrange(0, height)
    y2 = random.randrange(0, height)
    y_min = min(y1, y2)
    y_max = max(y2, y2)
    x_mid = random.randrange(x_min, x_max) if x_max - x_min > 0 else x_min
    y_mid = random.randrange(y_min, y_max) if y_max - y_min > 0 else y_min
    start = "{},{}".format(x_min, y_min)
    mid = "{},{}".format(x_mid, y_mid)
    end = "{},{}".format(x_max, y_max)
    paths.append([start, mid, end])

logging.debug("generated {} paths".format(len(paths)))

logging.info("generating word2vec models")
for limit in range(1, len(paths) + 1):
    limited_paths = paths[slice(limit)]
    logging.info("generating word2vec model with {} paths".format(len(limited_paths)))
    model = Word2Vec(limited_paths, min_count=0, workers=cpu_count())
    model_path = "{}/{}x{}.s{}.limit_{}.model.bin".format(
        data_directory, width, height, seed, limit
    )
    model.wv.save_word2vec_format(model_path, binary=True)
