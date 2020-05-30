import pickle

import numpy as np
from scipy.sparse import csr_matrix, save_npz, load_npz
import MySQLdb

db_host = 'localhost'
db_user = 'root'
db_port = 3306
db_password = 'mdty2020'
doc_texts: [str] = []
doc_titles: [str] = []
X = csr_matrix([])  # (doc_id, word_id) -> weight, doc_encoded as sparse matrix
vocab = np.array([], dtype=str)  # word id -> word
doc_topics = np.array([])  # (doc_id, n_topics) -> prob
doc_topics_reduced = np.array([])  # (doc_id, ) -> topic id
topics = np.array([])  # (n_topics, word_id) -> prob
n_features = 10000
n_topics = 5
random_seed = 2

np.random.seed(random_seed)


class Logger(object):
    def __init__(self, module_name):
        self.module_name = module_name

    def log(self, level, msg):
        print(f'<{self.module_name}> [{level}]', msg)

    def info(self, msg):
        self.log('Info', msg)

    def warn(self, msg):
        self.log('\033[33mWarn\033[0m', msg)

    def error(self, msg):
        self.log('\033[31mError\033[0m', msg)


logger = Logger('common')


def load_pickle(filename):
    with open(f'out/{filename}', 'rb') as f:
        return pickle.load(f)


def save_pickle(data, filename):
    with open(f'out/{filename}', 'wb') as f:
        pickle.dump(data, f)


def save_encoded_vocab():
    global X, vocab
    logger.info('Saving X and vocab...')
    save_npz('out/X.npz', X)
    np.save('out/vocab.npy', vocab)


def save_analyze_result():
    logger.info('Saving LDA results...')
    np.save('out/doc_topics.npy', doc_topics)
    np.save('out/doc_topics_reduced.npy', doc_topics_reduced)
    np.save('out/topics.npy', topics)


def load_doc():
    logger.info('Loading doc texts and titles...')
    db = MySQLdb.connect(db_host, user=db_user, port=db_port, password=db_password, charset='utf8')
    cursor = db.cursor()
    logger.info('Connected to db')
    try:
        cursor.execute('SELECT title, content FROM AntiNCP.Articles')
        results = cursor.fetchall()
        for row in results:
            doc_titles.append(row[0])
            doc_texts.append(row[1])
        cursor.close()
    except MySQLdb.DatabaseError as err:
        logger.error('Fail to execute sql')
        raise err
    logger.info(f'# doc: {len(doc_texts)}')
    db.close()


def load_encoded_vocab():
    logger.info('Loading X and vocab...')
    global X, vocab
    X = load_npz('out/X.npz')
    vocab = np.load('out/vocab.npy')
    logger.info(f'X: {X.shape}')
    logger.info(f'vocab: {vocab.shape}')


def load_analyze_result():
    logger.info('Loading LDA results...')
    global doc_topics, doc_topics_reduced, topics
    doc_topics = np.load('out/doc_topics.npy')
    doc_topics_reduced = np.load('out/doc_topics_reduced.npy')
    topics = np.load('out/topics.npy')
    logger.info(f'doc_topics: {doc_topics.shape}')
    logger.info(f'topics: {topics.shape}')
