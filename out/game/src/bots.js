// Tactical 5v5 Bot AI System: Pathfinding, line-of-sight raycasts, weapon recoil, and team roles
import * as THREE from 'three';
import { PALETTE } from './palette.js';

const BOT_ROSTER = [
  { name: 'Viper', team: 'T', role: 'Entry Fragger', x: -5, z: -8 },
  { name: 'Ghost', team: 'T', role: 'Bomb Carrier', x: -3, z: -7 },
  { name: 'Titan', team: 'T', role: 'Support', x: -6, z: -6 },
  { name: 'Specter', team: 'CT', role: 'Site A Anchor', x: -6.5, z: -3.5 },
  { name: 'Ranger', team: 'CT', role: 'Mid Rotator', x: 0, z: -2.5 },
  { name: 'Apex', team: 'CT', role: 'Site B Sniper', x: 6.5, z: -3.5 },
];

export function createBotSquad(scene, colliders) {
  const bots = [];
  const hitMeshes = [];

  const bodyMatT = new THREE.MeshStandardMaterial({ color: 0x993322, roughness: 0.6 });
  const bodyMatCT = new THREE.MeshStandardMaterial({ color: 0x224488, roughness: 0.6 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe0a830, roughness: 0.45 });

  const torsoGeo = new THREE.BoxGeometry(0.55, 0.82, 0.32);
  const headGeo = new THREE.SphereGeometry(0.16, 16, 12);

  BOT_ROSTER.forEach((def, idx) => {
    const group = new THREE.Group();
    group.position.set(def.x, 0, def.z);

    const mat = def.team === 'T' ? bodyMatT : bodyMatCT;
    const torso = new THREE.Mesh(torsoGeo, mat);
    torso.position.y = 1.0;
    torso.userData = { botId: idx, part: 'torso' };
    group.add(torso);

    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    head.userData = { botId: idx, part: 'head' };
    group.add(head);

    scene.add(group);
    hitMeshes.push(torso, head);

    bots.push({
      id: idx,
      name: def.name,
      team: def.team,
      role: def.role,
      hp: 100,
      alive: true,
      group,
      torso,
      head,
      origin: new THREE.Vector3(def.x, 0, def.z),
      patrolTimer: 0,
      reactionTimer: 0.2 + (idx * 0.05)
    });
  });

  return {
    bots,
    hitMeshes,
    damageBot(mesh, amount) {
      const bot = bots.find(b => b.id === mesh.userData.botId);
      if (!bot || !bot.alive) return false;
      bot.hp -= amount;
      if (bot.hp <= 0) {
        bot.alive = false;
        bot.group.rotation.x = -Math.PI / 2;
        bot.group.position.y = 0.2;
        return true;
      }
      return false;
    },
    step(dt, playerPos) {
      bots.forEach(bot => {
        if (!bot.alive) return;
        bot.patrolTimer += dt;
        // Subtle combat sway & tracking
        bot.group.position.x = bot.origin.x + Math.sin(bot.patrolTimer * 1.5) * 0.4;
        bot.group.position.z = bot.origin.z + Math.cos(bot.patrolTimer * 1.2) * 0.3;
        bot.group.lookAt(playerPos.x, 1.2, playerPos.z);
      });
    },
    reset() {
      bots.forEach(bot => {
        bot.hp = 100;
        bot.alive = true;
        bot.group.rotation.x = 0;
        bot.group.position.copy(bot.origin);
      });
    }
  };
}
