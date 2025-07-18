import numpy as np
import math
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class PropertyEmbedding:
    metadata_embedding: np.ndarray
    interior_embedding: Optional[np.ndarray] = None
    exterior_embedding: Optional[np.ndarray] = None
    yard_embedding: Optional[np.ndarray] = None

    metadata_confidence: float = 0.0
    interior_confidence: float = 0.0
    exterior_confidence: float = 0.0
    yard_confidence: float = 0.0

    @classmethod
    def from_property(cls,
                      property_data: dict,
                      max_images: Dict[str, int],
                      metadata_weights: Dict[str, float]):
        metadata = property_data.get('metadata', {})
        images = property_data.get('images', {})

        metadata_embedding = cls.embed_metadata(metadata, metadata_weights)
        metadata_confidence = cls.compute_metadata_confidence(metadata, metadata_weights)

        interior_emb = cls.average_embedding(images.get('interior', []))
        exterior_emb = cls.average_embedding(images.get('exterior', []))
        yard_emb = cls.average_embedding(images.get('yard', []))

        interior_conf = cls.compute_image_confidence(images.get('interior', []), max_images.get('interior', 1))
        exterior_conf = cls.compute_image_confidence(images.get('exterior', []), max_images.get('exterior', 1))
        yard_conf = cls.compute_image_confidence(images.get('yard', []), max_images.get('yard', 1))

        return cls(
            metadata_embedding=metadata_embedding,
            interior_embedding=interior_emb,
            exterior_embedding=exterior_emb,
            yard_embedding=yard_emb,
            metadata_confidence=metadata_confidence,
            interior_confidence=interior_conf,
            exterior_confidence=exterior_conf,
            yard_confidence=yard_conf
        )

    @staticmethod
    def embed_metadata(metadata: dict, weights: Dict[str, float]) -> np.ndarray:
        vector = [float(metadata.get(field, 0.0)) * weights.get(field, 1.0) for field in weights]
        return np.array(vector, dtype=np.float32)

    @staticmethod
    def compute_metadata_confidence(metadata: dict, weights: Dict[str, float]) -> float:
        total_weight = sum(weights.values())
        filled_weight = sum(
            weights[field] for field in weights
            if metadata.get(field) is not None and metadata.get(field) != ""
        )
        return filled_weight / total_weight if total_weight > 0 else 0.0

    @staticmethod
    def average_embedding(vectors: List[np.ndarray]) -> Optional[np.ndarray]:
        if not vectors:
            return None
        return np.mean(np.array(vectors), axis=0)

    @staticmethod
    def compute_image_confidence(images: List[np.ndarray], max_images: int) -> float:
        n = len(images)
        return math.log(n + 1) / math.log(max_images + 1) if max_images > 0 else 0.0
