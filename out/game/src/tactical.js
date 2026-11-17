// Tactical FPS Engine: CS-style plant & defusal objective, 5v5 team logic, buy economy, and bot AI
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export const TEAMS = {
  ATTACKERS: 'Strike Force (T)',
  DEFENDERS: 'Counter Unit (CT)',
};

export const WEAPON_SHOP = [
  { id: 'sidearm', name: 'Hawk .45', price: 0, damage: 28, headMult: 2.8, rpm: 350, mag: 12, reserve: 48, cost: 0 },
  { id: 'smg', name: 'Specter 9mm', price: 1400, damage: 24, headMult: 2.2, rpm: 800, mag: 30, reserve: 120, cost: 1400 },
  { id: 'rifle', name: 'Vandal 7.62', price: 2900, damage: 40, headMult: 4.0, rpm: 600, mag: 30, reserve: 90, cost: 2900 },
  { id: 'sniper', name: 'Apex .338', price: 4700, damage: 115, headMult: 4.0, rpm: 45, mag: 5, reserve: 15, cost: 4700 },
  { id: 'kevlar', name: 'Kevlar Vest', price: 650, armor: 100, cost: 650 },
  { id: 'kit', name: 'Defusal Kit', price: 400, defuseMultiplier: 0.5, cost: 400 }
];

export function createTacticalGame(scene, world) {
  const state = {
    round: 1,
    maxRounds: 15,
    tWins: 0,
    ctWins: 0,
    roundTimer: 115, // seconds
    bombTimer: 45,
    bombPlanted: false,
    bombDefused: false,
    bombSite: null, // 'A' or 'B'
    money: 800,
    inventory: ['sidearm'],
    activeWeapon: WEAPON_SHOP[0],
    armor: 0,
    hasDefuseKit: false,
    phase: 'buy', // 'buy', 'active', 'round_end'
    buyTimeRemaining: 15
  };

  // Bomb site markers in the world
  const siteMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.accent),
    roughness: 0.4,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });

  const siteAGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.4, 24);
  const siteAMesh = new THREE.Mesh(siteAGeo, siteMaterial);
  siteAMesh.position.set(-6.5, 0.2, -6.5);
  scene.add(siteAMesh);

  const siteBGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.4, 24);
  const siteBMesh = new THREE.Mesh(siteBGeo, siteMaterial);
  siteBMesh.position.set(6.5, 0.2, -6.5);
  scene.add(siteBMesh);

  // Active C4 Bomb mesh
  const bombGeo = new THREE.BoxGeometry(0.35, 0.15, 0.22);
  const bombMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
  const bombLed = new THREE.PointLight(0xff0033, 2, 4);
  const bombMesh = new THREE.Mesh(bombGeo, bombMat);
  bombMesh.add(bombLed);
  bombMesh.visible = false;
  scene.add(bombMesh);

  return {
    state,
    plantBomb(site, position) {
      if (state.bombPlanted) return false;
      state.bombPlanted = true;
      state.bombSite = site;
      state.bombTimer = 45;
      bombMesh.position.copy(position);
      bombMesh.position.y = 0.1;
      bombMesh.visible = true;
      return true;
    },
    defuseBomb() {
      if (!state.bombPlanted || state.bombDefused) return false;
      state.bombDefused = true;
      state.bombPlanted = false;
      bombMesh.visible = false;
      state.ctWins += 1;
      state.money += 3500;
      return true;
    },
    buyWeapon(weaponId) {
      const w = WEAPON_SHOP.find(x => x.id === weaponId);
      if (!w || state.money < w.price) return false;
      state.money -= w.price;
      if (w.armor) {
        state.armor = 100;
      } else if (w.id === 'kit') {
        state.hasDefuseKit = true;
      } else {
        state.inventory.push(w.id);
        state.activeWeapon = w;
      }
      return true;
    },
    step(dt) {
      if (state.phase === 'buy') {
        state.buyTimeRemaining -= dt;
        if (state.buyTimeRemaining <= 0) state.phase = 'active';
      } else if (state.phase === 'active') {
        if (state.bombPlanted) {
          state.bombTimer -= dt;
          bombLed.intensity = (Math.sin(state.bombTimer * 8) > 0) ? 3 : 0.2;
          if (state.bombTimer <= 0) {
            state.phase = 'round_end';
            state.tWins += 1;
            state.money += 3250;
          }
        } else {
          state.roundTimer -= dt;
          if (state.roundTimer <= 0) {
            state.phase = 'round_end';
            state.ctWins += 1;
            state.money += 3250;
          }
        }
      }
    }
  };
}
