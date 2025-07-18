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
        for aspect in ["metadata", "interior", "exterior", "yard"]:
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

        for i, id_a in enumerate(ids):
            emb_a = self.embeddings[id_a]
            heap = []

            for j, id_b in enumerate(ids):
                if id_a == id_b:
                    continue
                emb_b = self.embeddings[id_b]
                sim = self._aspect_similarity(emb_a, emb_b)

                if len(heap) < self.top_k:
                    heapq.heappush(heap, (sim, id_b))
                else:
                    heapq.heappushpop(heap, (sim, id_b))

            matrix[id_a] = sorted(heap, reverse=True)
        return matrix

    def add_property(self, new_id: str, new_embedding: PropertyEmbedding):
        self.embeddings[new_id] = new_embedding
        heap = []

        for existing_id, existing_embedding in self.embeddings.items():
            if existing_id == new_id:
                continue

            sim_to_existing = self._aspect_similarity(
                new_embedding, existing_embedding)
            sim_from_existing = self._aspect_similarity(
                existing_embedding, new_embedding)

            # Update new property heap
            if len(heap) < self.top_k:
                heapq.heappush(heap, (sim_to_existing, existing_id))
            else:
                heapq.heappushpop(heap, (sim_to_existing, existing_id))

            # Update existing property list
            existing_heap = self.similarity_index.get(existing_id, [])
            existing_heap.append((sim_from_existing, new_id))
            existing_heap = sorted(existing_heap, reverse=True)[:self.top_k]
            self.similarity_index[existing_id] = existing_heap

        self.similarity_index[new_id] = sorted(heap, reverse=True)

    def get_similar_properties(self, property_id: str) -> List[Tuple[str, float]]:
        return self.similarity_index.get(property_id, [])
