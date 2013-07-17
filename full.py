from wsgiref.simple_server import make_server
from tg import AppConfig, TGController
from tg import expose

from fblib import retrieve_foaf, get_histograms, get_top_degree, get_cluster_counts
from networkx.readwrite import json_graph as jg
from contextlib import closing
import json
import community
from collections import defaultdict

FBTOKEN = 'CAACEdEose0cBANVr16DRsZARwrSTj2sBBqXjF7DWZAVGrslmYy98Qm6j7fDSCQ1H5lg1d61ufZCyNtqPfm4joGgnssJOZCuGXwuuz2tNUAZCQosvRIYAzWks0gYC7VcspTvcupPoLLWOkCq2RfpPCohI7afxuIy7txxrVS0jknAZDZD'

class RootController(TGController):
    @expose('jinja:index.html')
    def index(self, **kw):
        return dict()

    @expose(content_type='application/json')
    def data(self, **kw):
        try:
            with closing(open('cache.json', 'r')) as data_file:
                print 'Reading from cache'
                return data_file.read()
        except IOError:
            print 'Fetching data'
            with closing(open('cache.json', 'w')) as data_file:
                foaf_graph = None
                try:
                    with closing(open('graph_cache.json', 'r')) as graph_file:
                        print 'Reading from graph cache'
                        foaf_graph = jg.load(graph_file)
                except IOError:
                    foaf_graph = retrieve_foaf(FBTOKEN)
                clusters = community.best_partition(foaf_graph)
                degree_distribution = get_histograms(foaf_graph)
                cluster_counts = get_cluster_counts(clusters)
                top10 = get_top_degree(foaf_graph, 10)
                foaf_json_graph = json.loads(jg.dumps(foaf_graph))
                ob = foaf_graph.degree()
                infos = {
                    'graph':foaf_json_graph,
                    'clusters':clusters,
                    'cluster_counts':cluster_counts,
                    'degree_distribution':degree_distribution,
                    'degree':foaf_graph.degree(),
                    'top10':top10
                }
                foaf_data = json.dumps(infos)
                data_file.write(foaf_data)
                return foaf_data

    @expose(content_type='application/json')
    def graph(self, **kw):
        with closing(open('graph_cache.json', 'w')) as graph_file:
            foaf_graph = retrieve_foaf(FBTOKEN)                             
            foaf_graph_json = jg.dumps(foaf_graph)
            graph_file.write(foaf_graph_json)
            return foaf_graph_json
 
config = AppConfig(minimal=True, root_controller=RootController())
config.serve_static = True
config.paths['static_files'] = './'

config.renderers = ['jinja', 'json']
config.default_renderer = 'jinja'

application = config.make_wsgi_app()

print 'Serving on port 8080...'
httpd = make_server('', 8080, application)
httpd.serve_forever()
