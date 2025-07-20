import numpy as np
import heapq
from typing import Dict, List, Tuple
from property_embedding import PropertyEmbedding


class SimilarityMatrix:
  def __init__(self,
               embeddings: Dict[str, PropertyEmbedding],
               aspect_weights: Dict[str, float],
               top_k: int = 10):
    self.embeddings = embeddings
    self.aspect_weights = aspect_weights
    self.top_k = top_k
    self.similarity_index = self._compute_similarity_matrix()

  def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
    if a is None or b is None or np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
      return 0.0
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

  def _aspect_similarity(self, a: PropertyEmbedding, b: PropertyEmbedding) -> float:
    total_score = 0.0
    for aspect in ["metadata", "interior", "exterior", "neighbourhood"]:
      emb_a = getattr(a, f"{aspect}_embedding")
      emb_b = getattr(b, f"{aspect}_embedding")
      conf_a = getattr(a, f"{aspect}_confidence")
      conf_b = getattr(b, f"{aspect}_confidence")

      aspect_weight = self.aspect_weights.get(aspect, 0.0)
      confidence_weight = (conf_a + conf_b) / 2

      sim = self._cosine_similarity(emb_a, emb_b)
      weighted_sim = sim * confidence_weight * aspect_weight

      total_score += weighted_sim

    return total_score

  def _compute_similarity_matrix(self) -> Dict[str, List[Tuple[str, float]]]:
    matrix = {}
    ids = list(self.embeddings.keys())

    for id_a in ids:
      emb_a = self.embeddings[id_a]
      heap = []

      for id_b in ids:
        if id_a == id_b:
          continue
        emb_b = self.embeddings[id_b]
        sim_score = self._aspect_similarity(emb_a, emb_b)
        heapq.heappush(heap, (sim_score, id_b))

      top_similar = heapq.nlargest(self.top_k, heap)
      matrix[id_a] = [(id_b, score) for score, id_b in top_similar]

    return matrix
