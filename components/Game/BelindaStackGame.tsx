
import React, { useState, useRef, useEffect, forwardRef, memo, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GAME_CONFIG } from '../../constants';
import { sounds as gameSounds } from '../../services/SoundService';
import { createTopTexture, createSideTexture } from './TextureGen';

// --- Types ---

interface BlockData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  index: number;
  isPerfect?: boolean;
}

interface DebrisData {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  rotation: [number, number, number];
  mass: number;
  createdAt: number;
}

interface WaveData {
  id: number;
  position: [number, number, number];
  color: string;
}

interface GameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, prize: string | null) => void;
  gameState: 'idle' | 'playing' | 'ended';
  onGameStart: () => void;
}

// --- Materials & Geometry ---

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const getBlockColor = (i: number) => {
  // Restored Beautiful/Soft Palette (Mint, Teal, Blue, Lavender)
  // Low contrast, very pleasant
  const palette = [
    '#48cfae', // Mint
    '#37bc9b', // Darker Teal
    '#4fc1e9', // Sky Blue
    '#3bafda', // Ocean Blue
    '#967adc', // Soft Purple
    '#ac92ec', // Lavender
    '#a0d468', // Grass Green
  ];
  return palette[i % palette.length];
};

// --- Physics Helpers ---

const checkAABBCollision = (pos1: number[], size1: number[], pos2: number[], size2: number[]) => {
  const half1 = [size1[0]/2, size1[1]/2, size1[2]/2];
  const half2 = [size2[0]/2, size2[1]/2, size2[2]/2];

  return (
    Math.abs(pos1[0] - pos2[0]) < (half1[0] + half2[0]) &&
    Math.abs(pos1[1] - pos2[1]) < (half1[1] + half2[1]) &&
    Math.abs(pos1[2] - pos2[2]) < (half1[2] + half2[2])
  );
};

// --- Components ---

const BlockMesh = memo(({ data }: { data: BlockData }) => {
  // Create textures per block
  const topTexture = useMemo(() => createTopTexture(data.size[0], data.size[2], data.color), [data.size, data.color]);
  const sideTexture = useMemo(() => createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, "ЛАМБРОТИН"), [data.size, data.color]);
  
  // Materials Array: Right, Left, Top, Bottom, Front, Back
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: sideTexture }), // Right
    new THREE.MeshStandardMaterial({ map: sideTexture }), // Left
    new THREE.MeshStandardMaterial({ map: topTexture }),  // Top
    new THREE.MeshStandardMaterial({ color: data.color }), // Bottom
    new THREE.MeshStandardMaterial({ map: sideTexture }), // Front
    new THREE.MeshStandardMaterial({ map: sideTexture }), // Back
  ], [sideTexture, topTexture, data.color]);

  return (
    <mesh 
      position={data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
      castShadow
      receiveShadow
    />
  );
});

const DebrisBox = memo(({ data, stack }: { data: DebrisData, stack: BlockData[] }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const pos = useRef(new THREE.Vector3(...data.position));
  const rot = useRef(new THREE.Euler(...data.rotation));
  const vel = useRef(new THREE.Vector3(...data.velocity));
  const angVel = useRef(new THREE.Vector3(...data.angularVelocity));
  
  const topTexture = useMemo(() => createTopTexture(data.size[0], data.size[2], data.color), [data.size, data.color]);
  const sideTexture = useMemo(() => createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, "ЛАМБРОТИН"), [data.size, data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: topTexture }), 
    new THREE.MeshStandardMaterial({ color: data.color }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
  ], [sideTexture, topTexture, data.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Physics Step
    const gravity = -25;
    vel.current.y += gravity * delta;
    
    // Apply Velocity
    pos.current.add(vel.current.clone().multiplyScalar(delta));
    
    // Apply Rotation
    rot.current.x += angVel.current.x * delta;
    rot.current.y += angVel.current.y * delta;
    rot.current.z += angVel.current.z * delta;

    // Collision with Stack (Simplified AABB)
    // Debris only interacts with the top 5 blocks to save performance
    // This gives the effect of "otlomki interacting" without checking the whole tower
    for (let i = stack.length - 1; i >= Math.max(0, stack.length - 6); i--) {
        const block = stack[i];
        if (checkAABBCollision(
            [pos.current.x, pos.current.y, pos.current.z], data.size,
            block.position, block.size
        )) {
            // Simple Bounce Response
            const overlapY = (block.position[1] + GAME_CONFIG.BOX_HEIGHT/2) - (pos.current.y - GAME_CONFIG.BOX_HEIGHT/2);
            
            // Only bounce if hitting from above (mostly)
            if (overlapY > 0 && vel.current.y < 0) {
                pos.current.y += overlapY * 0.5; // Push out partially
                vel.current.y *= -0.4; // Dampened bounce
                
                // Deflect sideways based on where it hit
                vel.current.x += (pos.current.x - block.position[0]) * 5;
                vel.current.z += (pos.current.z - block.position[2]) * 5;
                
                // Add spin on impact
                angVel.current.x += (Math.random() - 0.5) * 10;
                angVel.current.z += (Math.random() - 0.5) * 10;
            }
        }
    }

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.copy(rot.current);
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
      castShadow
    />
  );
});

const Wave = memo(({ data }: { data: WaveData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 4.0;
    meshRef.current.scale.x += delta * speed;
    meshRef.current.scale.y += delta * speed;
    
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity -= delta * 1.2;
    if (mat.opacity < 0) mat.opacity = 0;
  });

  return (
    <mesh ref={meshRef} position={data.position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.0, 1.2, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
});

const ActiveBox = forwardRef((props: { data: BlockData, direction: 'x' | 'z', moveSpeed: number, limit: number }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const time = useRef(Math.PI / 2);
  
  // Textures
  const topTexture = useMemo(() => createTopTexture(props.data.size[0], props.data.size[2], props.data.color), [props.data.size, props.data.color]);
  const sideTexture = useMemo(() => createSideTexture(props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.color, "ЛАМБРОТИН"), [props.data.size, props.data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: topTexture }), 
    new THREE.MeshStandardMaterial({ color: props.data.color }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
    new THREE.MeshStandardMaterial({ map: sideTexture }), 
  ], [sideTexture, topTexture, props.data.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * props.moveSpeed;
    const offset = Math.sin(time.current) * props.limit;
    
    const x = props.direction === 'x' ? props.data.position[0] + offset : props.data.position[0];
    const z = props.direction === 'z' ? props.data.position[2] + offset : props.data.position[2];
    
    meshRef.current.position.set(x, props.data.position[1], z);
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.set(x, props.data.position[1], z);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={props.data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.size[2]]}
      castShadow
    />
  );
});

const GameScene = ({ onGameOver, onScoreUpdate, gameState, triggerClick }: GameProps & { triggerClick: React.MutableRefObject<() => void> }) => {
  const [stack, setStack] = useState<BlockData[]>([]);
  const [debris, setDebris] = useState<DebrisData[]>([]);
  const [waves, setWaves] = useState<WaveData[]>([]);
  const [activeConfig, setActiveConfig] = useState<{ data: BlockData; direction: 'x' | 'z'; limit: number; moveSpeed: number; } | null>(null);
  
  const activePosRef = useRef(new THREE.Vector3()); 
  const scoreRef = useRef(0);
  const camLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  const initGame = () => {
    scoreRef.current = 0;
    setDebris([]);
    setWaves([]);
    const base: BlockData = { 
      position: [0, 0, 0], 
      size: [GAME_CONFIG.INITIAL_SIZE, GAME_CONFIG.BOX_HEIGHT, GAME_CONFIG.INITIAL_SIZE], 
      color: getBlockColor(0), 
      index: 0 
    };
    setStack([base]);
    spawnNext(base);
    updateBG(0);
  };

  const updateBG = (score: number) => {
    const bgEl = document.getElementById('game-background');
    if (bgEl) {
      // Soft teal/blue gradient (Belinda style)
      // Transitioning slightly warmer as you go up, but staying soft
      bgEl.style.background = `linear-gradient(to bottom, #d6e8f5 0%, #aed9e0 100%)`;
    }
  };

  useEffect(() => { if (gameState === 'idle') initGame(); }, [gameState]);

  useFrame((state, delta) => {
     // No main stack wobble here. Base block stays perfectly still.
     // We only update camera and debris (handled in DebrisBox).
  });

  const spawnNext = (prev: BlockData) => {
    const idx = prev.index + 1;
    const dir = idx % 2 === 0 ? 'x' : 'z';
    const moveSpeed = GAME_CONFIG.BASE_SPEED;
    
    setActiveConfig({ 
      data: { position: [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]], size: [...prev.size], color: getBlockColor(idx), index: idx },
      direction: dir, limit: 5.2, moveSpeed: moveSpeed * 65
    });
  };

  const handleClick = () => {
    if (gameState !== 'playing' || !activeConfig) return;
    
    const current = activePosRef.current.clone();
    const prev = stack[stack.length - 1];
    const axis = activeConfig.direction === 'x' ? 0 : 2;
    const delta = current.getComponent(axis) - prev.position[axis];
    const overhang = Math.abs(delta);
    const size = prev.size[axis];

    if (overhang >= size) {
      gameSounds.playGameOver();
      onGameOver(scoreRef.current);
      return;
    }

    const isPerfect = overhang < 0.15; // Threshold for perfect landing
    let finalDelta = isPerfect ? 0 : delta;
    let overlap = size - Math.abs(finalDelta);
    let newSize = [...prev.size] as [number, number, number];
    
    const newPos = [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]] as [number, number, number];
    newPos[axis] = prev.position[axis] + (finalDelta / 2);

    if (isPerfect) {
      gameSounds.playPerfect();
      setWaves(w => [...w.slice(-5), {
        id: Math.random(),
        position: [newPos[0], newPos[1] - GAME_CONFIG.BOX_HEIGHT / 2, newPos[2]],
        color: activeConfig.data.color
      }]);
    } else {
      gameSounds.playLanding(scoreRef.current);
      // Spawn debris
      setDebris(d => {
        const dSize = [...prev.size] as [number, number, number];
        dSize[axis] = overhang;
        const dPos = [current.x, current.y, current.z] as [number, number, number];
        
        // Correct debris position calculation
        const sign = Math.sign(delta);
        const centerOffset = (size / 2) + (overhang / 2); 
        
        dPos[axis] = prev.position[axis] + (sign * centerOffset);
        
        return [...d.slice(-15), { 
          id: Math.random(), 
          position: dPos, 
          size: dSize, 
          color: activeConfig.data.color, 
          velocity: [
              axis === 0 ? sign * 3 : (Math.random()-0.5), 
              5, // Jump up a bit
              axis === 2 ? sign * 3 : (Math.random()-0.5)
          ], 
          angularVelocity: [Math.random()*5, Math.random()*5, Math.random()*5],
          rotation: [0, 0, 0],
          mass: 1,
          createdAt: Date.now()
        }];
      });
    }

    newSize[axis] = overlap;
    
    if (newSize[axis] < 0.1) {
      gameSounds.playGameOver();
      onGameOver(scoreRef.current);
      return;
    }

    const landed: BlockData = { 
      position: newPos, 
      size: newSize, 
      color: activeConfig.data.color, 
      index: activeConfig.data.index,
      isPerfect: isPerfect
    };
    
    setStack(s => [...s, landed]);
    scoreRef.current++;
    updateBG(scoreRef.current);
    onScoreUpdate(scoreRef.current, null);
    spawnNext(landed);
  };

  triggerClick.current = handleClick;

  useFrame((state) => {
    const totalHeight = stack.length * GAME_CONFIG.BOX_HEIGHT;
    
    if (gameState === 'ended') {
      const radius = 30;
      const angle = state.clock.getElapsedTime() * 0.2;
      state.camera.position.x = Math.sin(angle) * radius;
      state.camera.position.z = Math.cos(angle) * radius;
      state.camera.position.y = totalHeight / 2 + 10;
      state.camera.lookAt(0, totalHeight / 2, 0);
      return;
    }

    const targetY = totalHeight + 8.5;
    state.camera.position.lerp(new THREE.Vector3(18, targetY + 10, 18), 0.05);
    camLookAt.current.lerp(new THREE.Vector3(0, totalHeight + 2.5, 0), 0.05);
    state.camera.lookAt(camLookAt.current);
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ffffff" />
      
      {/* Rigid Stack (No Wobble) */}
      <group>
          {stack.map(b => <BlockMesh key={b.index} data={b} />)}
      </group>

      {/* Debris with Physics */}
      {debris.map(d => <DebrisBox key={d.id} data={d} stack={stack} />)}
      
      {waves.map(w => <Wave key={w.id} data={w} />)}
      
      {activeConfig && gameState === 'playing' && (
        <ActiveBox ref={activePosRef} data={activeConfig.data} direction={activeConfig.direction} moveSpeed={activeConfig.moveSpeed} limit={5.2} />
      )}
    </group>
  );
};

export const BelindaStackGame = ({ onGameOver, onScoreUpdate, gameState, onGameStart }: GameProps) => {
  const triggerClickRef = useRef(() => {});
  
  return (
    <div className="w-full h-full touch-none" onPointerDown={(e) => { 
      if (gameState === 'idle') { 
        gameSounds.playStart(); 
        onGameStart(); 
      }
      triggerClickRef.current();
    }}>
      <Canvas 
        shadows
        dpr={window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio} 
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} 
      >
        <OrthographicCamera makeDefault position={[18, 18, 18]} zoom={45} near={-50} far={200} />
        <GameScene onGameOver={onGameOver} onScoreUpdate={onScoreUpdate} onGameStart={onGameStart} triggerClick={triggerClickRef} gameState={gameState} />
      </Canvas>
    </div>
  );
};
