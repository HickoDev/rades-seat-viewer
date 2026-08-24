import { BufferGeometry, Mesh } from 'three';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';

let enabled = false;

export function enableBvhRaycasting() {
  if (enabled) return;
  BufferGeometry.prototype.computeBoundsTree =
    computeBoundsTree as unknown as BufferGeometry['computeBoundsTree'];
  BufferGeometry.prototype.disposeBoundsTree =
    disposeBoundsTree as BufferGeometry['disposeBoundsTree'];
  Mesh.prototype.raycast = acceleratedRaycast;
  enabled = true;
}
