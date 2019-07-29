import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count
import random
import itertools


parser = argparse.ArgumentParser()
parser.add_argument("--width", type=int, help="width of grid square", default=10)
parser.add_argument(
    "--num_paths", type=int, help="number of paths to create", default=1000
)
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


def random_ordered_pair(limit):
    r1 = random.randrange(0, limit)
    r2 = random.randrange(0, limit)
    return min(r1, r2), max(r1, r2)


def generate_paths():
    while True:
        x_min, x_max = random_ordered_pair(width)
        y_min, y_max = random_ordered_pair(height)
        x_diff = x_max - x_min
        y_diff = y_max - y_min
        if x_diff > 1 or y_diff > 1:
            x_mid = random.randrange(x_min, x_max + 1) if x_max - x_min > 0 else x_min
            y_mid = random.randrange(y_min, y_max + 1) if y_max - y_min > 0 else y_min
            start = (x_min, y_min)
            mid = (x_mid, y_mid)
            end = (x_max, y_max)
            if start != mid and mid != end:
                yield [start, mid, end]


def filter_length(max_length):
    def filter(path):
        [start, _, end] = path
        x_start, y_start = start
        x_end, y_end = end
        x_diff = x_end - x_start
        y_diff = y_end - y_start
        return x_diff <= max_length and y_diff <= max_length

    return filter


filtered = filter(filter_length(3), generate_paths())
paths = list(itertools.islice(filtered, args.num_paths))


def format_point(point):
    x, y = point
    return "{},{}".format(x, y)


formatted_paths = []
for path in paths:
    formatted_paths.append(" ".join(map(format_point, path)))


with open("{}/paths.txt".format(data_directory), "w") as out:
    for path in formatted_paths:
        out.write(path)
        out.write("\n")
