import * as THREE from 'three';

function updateMaterials(root, configure) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const styledMaterials = materials.map((source) => {
      const material = source.clone();
      configure(material);
      return material;
    });
    object.material = Array.isArray(object.material) ? styledMaterials : styledMaterials[0];
  });
}

export function preparePlayerModel(scene, targetHeight) {
  const model = scene.clone(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = targetHeight / (size.y || 1);
  model.scale.setScalar(scale);
  model.position.y -= new THREE.Box3().setFromObject(model).min.y;

  updateMaterials(model, (material) => {
    if (material.color) material.color.lerp(new THREE.Color('#c7e9f5'), 0.42);
    if ('metalness' in material) material.metalness = 0.48;
    if ('roughness' in material) material.roughness = 0.46;
    if (material.emissive) {
      material.emissive.set('#16465c');
      material.emissiveIntensity = 0.55;
    }
  });

  return model;
}

export function prepareEnemyModel(scene, targetHeight) {
  const model = scene.clone(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = targetHeight / (size.y || 1);
  model.scale.setScalar(scale);
  model.position.y -= new THREE.Box3().setFromObject(model).min.y;

  updateMaterials(model, (material) => {
    if (material.color) material.color.multiplyScalar(1.5);
    if ('metalness' in material) material.metalness = 0.72;
    if ('roughness' in material) material.roughness = 0.38;
    if (material.emissive) {
      material.emissive.set('#68131d');
      material.emissiveIntensity = 0.9;
    }
  });

  return model;
}
