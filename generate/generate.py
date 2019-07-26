import argparse
import logging
import gensim
from gensim import corpora
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count


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

logging.info("generating paths")
paths = [["0,0", "{},{}".format(width - 1, height - 1)]]
logging.debug(paths)

logging.info("generating word2vec model")
model = Word2Vec(paths, min_count=0, workers=cpu_count())
logging.debug(model["0,0"])
logging.debug(model.wv.most_similar("0,0"))
