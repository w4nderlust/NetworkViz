import requests
from contextlib import closing
import networkx as nx

import logging
from multiprocessing import Queue, Pool
from collections import defaultdict

log = logging.getLogger(__name__)

API_URL = 'https://graph.facebook.com'
FRIENDS_RELATIVE_URL = '/me/friends'
MUTUAL_RELATIVE_URL = '/me/mutualfriends/%s'

def _fetch_data(url, token):
    resp = requests.get(url, params={'format':'json', 'access_token':token})
    log.debug(resp)
    return resp.json()

def _fetch_paginated_data(url, token):
    results = []

    while True:
        result = _fetch_data(url, token)
        if 'error' in result:
            log.error(result['error'])

        results.extend(result['data'])
        url = result.get('paging', {}).get('next')
        if url is None:
            break

    return results

def get_friends(token):
    return _fetch_paginated_data(API_URL + FRIENDS_RELATIVE_URL, token)

def get_foaf(user, token):
    return _fetch_paginated_data(API_URL + MUTUAL_RELATIVE_URL % user, token)


results_queue = Queue()
class LinkingPerformer(object):
    def __init__(self, token):
        self.token = token

    def __call__(self, friend):
        user_id = friend['id']
        print 'Fetching data of User %s...' % user_id
        for foaf in get_foaf(user_id, self.token):
            results_queue.put((user_id, foaf['id']))

def retrieve_foaf(token):
    entries = nx.Graph()
    print 'Fetching your friends...'
    foaf = {}
    friends = get_friends(token)
    for count, user in enumerate(friends):
        entries.add_node(user['id'], name=user['name'])

    perform_linking = LinkingPerformer(token)

    pool = Pool(10)
    pool.map(perform_linking, friends)

    print 'Making Graph Data...'
    while not results_queue.empty():
        entries.add_edge(*results_queue.get())
    
    for act_node in entries.nodes():
        if entries.degree(act_node) < 1:
            entries.remove_node(act_node)

    return entries

def get_histograms(graph):
    values = sorted(set(graph.degree().values()))
    counts = [(x, graph.degree().values().count(x)) for x in values]
    return counts

def get_top_degree(graph, n):
    nodes_degree = {}
    for node, attributes in graph.nodes(True):
        nodes_degree[attributes['name']] = (graph.degree(node), node)
    sorted_nodes_degree = sorted(nodes_degree.items(), key=lambda x: x[1], reverse=True)
    return sorted_nodes_degree[:n]

def get_cluster_counts(clusters):
    print clusters
    print clusters.items()
    cluster_counts = defaultdict(int)
    for node, cluster in clusters.items():
        cluster_counts[cluster] += 1
    print 'outside'
    print cluster_counts
    sorted_cluster_counts = sorted(cluster_counts.items(), key=lambda x: x[1], reverse=True)
    return sorted_cluster_counts
