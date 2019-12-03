# vec2vec
vectors beget vectors

(inspired by https://pydata.org/london2019/schedule/presentation/55/goofing-off-with-fun-big-data/)

## Idea

This was a play-around with the idea: 
- *if* word2vec is a method which allows an N-dimensional space of word embeddings to be derived from a corpus where those words occur, with distance in that space being correlated with probability of co-occurrence in corpus
- *then* can word2vec be used to derive a 2d space of points, if the words are points in the 2d space and the sentences are paths through the space?

## Method

My method to test this was:
- Create a 10 x 10 grid
- Randomly sample P paths from that grid, where the paths are:
  - minimal paths of length 2 i.e. from (x1,y1) to (x2,y2)
  - the start and end points have a min/max manhattan distance of 2 and 3, respectively
- Convert paths to a corpus, where each path is a separate line
- Train word2vec on that corpus, with a dimension D, and all other parameters set to defaults
- For the resulting model, go over each word (point) and ask for the 8 most similar words (points) ranked by cosine similarity
- Visualise:
  - Interpet those similarities as distances between points
  - Color points based on their grid position
  - Render as a force-layout graph where the graph can:
    - be left to lay itself out based on balance of forces
    - or be forced to conform to the known 10 x 10 grid positions
- Manually evaluate whether it has learned the grid by looking for:
  - Local clustering of points with similar colors indicating similar grid positions
  - Lack of far-links i.e. seeing points generally connecting to local points and not jumping past them to more distant points

## Results

I tried varying P, number of paths, and D, number of dimensions. You can see the result here: https://vibrant-curran-b40bc3.netlify.com/

Based on above, my answer seems to be: *maybe* i.e. it seems to be learning some structure but it's not a clear grid with no far-links.

Note that I was temporarily fooled by allowing the manhattan distance to be 1 i.e. points right next to each other. This produced nice grids, though still not perfect. I change the minimum distance to be 2 so that it would be forced to learn local structure of space through samples of larger leaps through the space.

## Implementation

This is a first implementation, done on holiday for fun, so is bit hacky and likely has some mistakes.

Also, I delibrately chose to play around with a few implementation languages (Rust) and libraries (Svelte) which are not strictly needed.
