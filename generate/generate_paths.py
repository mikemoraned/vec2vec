import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count
import random
import itertools
from tqdm import tqdm


parser = argparse.ArgumentParser()
parser.add_argument("--width", type=int, help="width of grid square", default=10)
parser.add_argument(
    "--min_distance", type=int, help="min manhattan distance", required=True
)
parser.add_argument(
    "--max_distance", type=int, help="max manhattan distance", required=True
)
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

width = args.width
height = width
logging.info(
    "using %d x %d grid, seed of %d, min distance %d, max distance %d, saving in %s",
    width,
    height,
    args.seed,
    args.min_distance,
    args.max_distance,
    args.data_directory,
)
base_name = "{}x{}.paths{}.seed{}.dist{},{}".format(
    width, height, args.num_paths, args.seed, args.min_distance, args.max_distance
)
output_file = "{}/{}.paths.txt".format(args.data_directory, base_name)
logging.info("base name = {}, output file = {}".format(base_name, output_file))


logging.info("generating paths")


class Point(object):
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def max_manhattan_distance(self, other):
        return max(abs(self.x - other.x), abs(self.y - other.y))


format_for_index = {}
point_for_index = {}
for x in range(0, width):
    for y in range(0, height):
        index = (y * width) + x
        format_for_index[index] = "{},{}".format(x, y)
        point_for_index[index] = Point(x, y)

range_end = width * height

possible_pairs=[]
with tqdm(total=range_end * range_end) as pairs_progress:
    for start_index in range(0, range_end):
        for end_index in range(0, range_end):
            start_point = point_for_index[start_index]
            end_point = point_for_index[end_index]
            manhattan_distance = start_point.max_manhattan_distance(end_point)
            if args.min_distance <= manhattan_distance and manhattan_distance <= args.max_distance:
                possible_pairs.append("{} {}".format(format_for_index[start_index], format_for_index[end_index]))
            pairs_progress.update(1)

num_possible_pairs = len(possible_pairs)

with open(output_file, "w") as out:
    with tqdm(total=args.num_paths) as paths_progress:
        for path_num in range(0, args.num_paths):
            formatted_path = possible_pairs[random.randrange(0, num_possible_pairs)]
            out.write(formatted_path)
            out.write("\n")
            paths_progress.update(1)
