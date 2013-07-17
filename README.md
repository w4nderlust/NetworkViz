NetworkViz
==========

Visualizing my Facebook friends with d3.js, TurboGears and NetowrkX

To test it, install TurboGears 2.3 (+ jinja):
pip install -f http://tg.gy/230 TurboGears2
pip install jinja2

then install NetowrkX, see http://networkx.github.io/documentation/latest/install.html

then run full.py
python full.py

open the browser on localhost, you should see my friend graph.

If you want to see your graph, dele graph.json and cache.json
get a Facebook token with all the privileges (you need only the ones related to freinds)
substitute it inside fblib.py
run full.py

This time it will take longer as the script downloads you freinds
creates the graph.json
runs the community detection algorithm
and creates the cache.json file that will be used by d3.js
