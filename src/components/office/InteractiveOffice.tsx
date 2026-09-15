import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useCompany } from '../../context/CompanyContext';
import { Employee, Department } from '../../types';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Crown,
  Users,
  Layers,
  ChevronRight,
  Coffee,
  Laptop,
  Cpu,
  Palette,
  TrendingUp,
  Compass,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

export interface InteractiveOfficeProps {
  simplified?: boolean;
}

interface ZoneConfig {
  id: string;
  name: string;
  arabicName: string;
  type: 'ceo' | 'boardroom' | 'lounge' | 'dept';
  pos: [number, number, number];
  size: [number, number];
  floorColor: number;
  glowColor: string;
  deptId?: string;
  icon: string;
  cameraTarget: { x: number; y: number; z: number; radius: number; theta: number; phi: number };
}

const ZONES: ZoneConfig[] = [
  {
    id: 'ceo',
    name: "Nawaf's Executive Suite",
    arabicName: 'جناح مكتب نواف التنفيذي',
    type: 'ceo',
    pos: [0, 0, -16],
    size: [14, 10],
    floorColor: 0x1f160b, // luxurious dark walnut
    glowColor: '#f59e0b',
    icon: '👑',
    cameraTarget: { x: 0, y: 0, z: -16, radius: 24, theta: 0.1, phi: 1.05 }
  },
  {
    id: 'boardroom',
    name: 'Executive Boardroom',
    arabicName: 'قاعة الاجتماعات الكبرى',
    type: 'boardroom',
    pos: [16, 0, -2],
    size: [12, 10],
    floorColor: 0x071e22, // deep cyan glass
    glowColor: '#06b6d4',
    icon: '👥',
    cameraTarget: { x: 16, y: 0, z: -2, radius: 25, theta: 1.35, phi: 1.1 }
  },
  {
    id: 'lounge',
    name: 'Executive Breakout Lounge',
    arabicName: 'استراحة ونادي الابتكار',
    type: 'lounge',
    pos: [-16, 0, -2],
    size: [12, 10],
    floorColor: 0x221318, // warm espresso / rose gold
    glowColor: '#ec4899',
    icon: '☕',
    cameraTarget: { x: -16, y: 0, z: -2, radius: 25, theta: -1.35, phi: 1.1 }
  },
  {
    id: 'systems',
    name: 'Systems & Engineering Lab',
    arabicName: 'مختبر الهندسة والأنظمة',
    type: 'dept',
    deptId: 'tech',
    pos: [14, 0, 12],
    size: [11, 9],
    floorColor: 0x091e1d, // emerald tech
    glowColor: '#10b981',
    icon: '⚡',
    cameraTarget: { x: 14, y: 0, z: 12, radius: 24, theta: 2.1, phi: 1.1 }
  },
  {
    id: 'creative',
    name: 'Design & Creative Studio',
    arabicName: 'استوديو التصميم وتجربة المستخدم',
    type: 'dept',
    deptId: 'product',
    pos: [0, 0, 16],
    size: [12, 9],
    floorColor: 0x1a0f2e, // deep indigo
    glowColor: '#a855f7',
    icon: '🎨',
    cameraTarget: { x: 0, y: 0, z: 16, radius: 24, theta: 3.14, phi: 1.1 }
  },
  {
    id: 'pm',
    name: 'Operations & Strategy Wing',
    arabicName: 'إدارة العمليات والمشاريع',
    type: 'dept',
    deptId: 'ops',
    pos: [-14, 0, 12],
    size: [11, 9],
    floorColor: 0x0e172a, // cobalt slate
    glowColor: '#3b82f6',
    icon: '📊',
    cameraTarget: { x: -14, y: 0, z: 12, radius: 24, theta: -2.1, phi: 1.1 }
  }
];

export const InteractiveOffice: React.FC<InteractiveOfficeProps> = () => {
  const { 
    departments, 
    employees, 
    decisions,
    setSelectedDepartment, 
    setSelectedEmployee,
    setIsCeoCommandOpen,
    setIsMeetingModalOpen,
    meetingSession
  } = useCompany();

  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredRobot, setHoveredRobot] = useState<Employee | null>(null);
  const [activeZoneView, setActiveZoneView] = useState<string>('all');
  const [zoneScreens, setZoneScreens] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);

  const pendingApprovalsCount = decisions.filter(d => d.status === 'waiting').length;

  // Scene Reference
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    robotMeshes: Map<string, {
      group: THREE.Group;
      currentPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      currentRot: number;
      targetRot: number;
      leftArm: THREE.Mesh;
      rightArm: THREE.Mesh;
      head: THREE.Group;
      visorMesh: THREE.Mesh;
      badgeMesh: THREE.Mesh;
      lightMesh: THREE.Mesh;
      emp: Employee;
      state: string;
      animOffset: number;
    }>;
    collaborationBeam: THREE.Line | null;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    animFrameId: number;
    disposed: boolean;
    isOrbiting: boolean;
    lastMouseX: number;
    lastMouseY: number;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    spherical: { radius: number; theta: number; phi: number };
    targetSpherical: { radius: number; theta: number; phi: number };
  } | null>(null);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Fly camera to a specific zone
  const focusOnZone = (zoneId: string) => {
    setActiveZoneView(zoneId);
    if (!sceneRef.current) return;

    if (zoneId === 'all') {
      sceneRef.current.targetLookAt.set(0, 0, 0);
      sceneRef.current.targetSpherical = { radius: 56, theta: 0.68, phi: 1.05 };
      return;
    }

    const zone = ZONES.find(z => z.id === zoneId);
    if (zone) {
      sceneRef.current.targetLookAt.set(zone.cameraTarget.x, zone.cameraTarget.y, zone.cameraTarget.z);
      sceneRef.current.targetSpherical = {
        radius: zone.cameraTarget.radius,
        theta: zone.cameraTarget.theta,
        phi: zone.cameraTarget.phi
      };
    }
  };

  const zoomCamera = (delta: number) => {
    if (!sceneRef.current) return;
    sceneRef.current.targetSpherical.radius = Math.max(20, Math.min(85, sceneRef.current.targetSpherical.radius + delta));
  };

  // Main Three.js setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 900;
    const height = mount.clientHeight || 620;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.011);

    // 2. Camera Setup (Isometric Perspective with optimal angle)
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 350);
    const spherical = { radius: 56, theta: 0.68, phi: 1.05 };
    const targetSpherical = { ...spherical };
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    const sinPhiRadius = spherical.radius * Math.sin(spherical.phi);
    camera.position.set(
      sinPhiRadius * Math.sin(spherical.theta),
      spherical.radius * Math.cos(spherical.phi),
      sinPhiRadius * Math.cos(spherical.theta)
    );
    camera.lookAt(currentLookAt);

    // 3. High Performance Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 4. Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.7);
    scene.add(ambientLight);

    // Key Directional Light (Warm executive daylight)
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(30, 48, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    scene.add(sunLight);

    // Subtle Cyan Cool Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-30, 32, -22);
    scene.add(fillLight);

    // Nawaf Office Gold Accent Light
    const ceoLight = new THREE.PointLight(0xf59e0b, 1.2, 18);
    ceoLight.position.set(0, 5, -16);
    scene.add(ceoLight);

    // Boardroom Cyan Accent Light
    const boardLight = new THREE.PointLight(0x06b6d4, 1.0, 16);
    boardLight.position.set(16, 5, -2);
    scene.add(boardLight);

    // Lounge Warm Accent Light
    const loungeLight = new THREE.PointLight(0xf43f5e, 1.0, 16);
    loungeLight.position.set(-16, 5, -2);
    scene.add(loungeLight);

    // 5. Grand Headquarters Floor Baseplate
    const floorGeo = new THREE.BoxGeometry(54, 0.7, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090e1c,
      roughness: 0.6,
      metalness: 0.25
    });
    const floorPlate = new THREE.Mesh(floorGeo, floorMat);
    floorPlate.position.y = -0.35;
    floorPlate.receiveShadow = true;
    scene.add(floorPlate);

    // Sleek Architectural Grid Inlay
    const grid = new THREE.GridHelper(50, 25, 0x1e293b, 0x0b1329);
    grid.position.y = 0.02;
    scene.add(grid);

    // Central Atrium Circular Plaza
    const centralRingGeo = new THREE.RingGeometry(4.2, 4.45, 64);
    const centralRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
    const centralRing = new THREE.Mesh(centralRingGeo, centralRingMat);
    centralRing.rotation.x = -Math.PI / 2;
    centralRing.position.y = 0.03;
    scene.add(centralRing);

    // Inner Accent Ring
    const innerRingGeo = new THREE.RingGeometry(2.0, 2.12, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.035;
    scene.add(innerRing);

    // Hologram Projector Pedestal in Center
    const holoPedestalGeo = new THREE.CylinderGeometry(1.4, 1.7, 0.35, 32);
    const holoPedestalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    const holoPedestal = new THREE.Mesh(holoPedestalGeo, holoPedestalMat);
    holoPedestal.position.set(0, 0.17, 0);
    scene.add(holoPedestal);

    // Central Floating Hologram Gem
    const holoGemGeo = new THREE.OctahedronGeometry(0.8, 0);
    const holoGemMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      wireframe: true
    });
    const holoGem = new THREE.Mesh(holoGemGeo, holoGemMat);
    holoGem.position.set(0, 2.0, 0);
    scene.add(holoGem);

    // Central Rotating Data Rings
    const dataRingGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 64);
    const dataRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const dataRing = new THREE.Mesh(dataRingGeo, dataRingMat);
    dataRing.position.set(0, 2.0, 0);
    scene.add(dataRing);

    // 6. Build Distinct Architectural Zones
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.82,
      thickness: 0.4
    });

    ZONES.forEach((zone) => {
      const zoneGroup = new THREE.Group();
      zoneGroup.position.set(zone.pos[0], 0, zone.pos[2]);

      // Zone Floor Slab
      const slabGeo = new THREE.BoxGeometry(zone.size[0], 0.12, zone.size[1]);
      const slabMat = new THREE.MeshStandardMaterial({
        color: zone.floorColor,
        roughness: 0.45,
        metalness: 0.3
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = 0.06;
      slab.receiveShadow = true;
      zoneGroup.add(slab);

      // Glass Enclosure Walls
      const wallHeight = 1.5;
      const wallThick = 0.08;

      // Back partition
      const backWallGeo = new THREE.BoxGeometry(zone.size[0], wallHeight, wallThick);
      const backWall = new THREE.Mesh(backWallGeo, glassMat);
      backWall.position.set(0, wallHeight / 2, -zone.size[1] / 2);
      zoneGroup.add(backWall);

      // Side partitions
      const side1Geo = new THREE.BoxGeometry(wallThick, wallHeight, zone.size[1]);
      const side1 = new THREE.Mesh(side1Geo, glassMat);
      side1.position.set(-zone.size[0] / 2, wallHeight / 2, 0);
      zoneGroup.add(side1);

      const side2Geo = new THREE.BoxGeometry(wallThick, wallHeight, zone.size[1]);
      const side2 = new THREE.Mesh(side2Geo, glassMat);
      side2.position.set(zone.size[0] / 2, wallHeight / 2, 0);
      zoneGroup.add(side2);

      // Metallic Top Rim
      const rimMat = new THREE.MeshStandardMaterial({
        color: zone.type === 'ceo' ? 0xf59e0b : (zone.type === 'boardroom' ? 0x06b6d4 : (zone.type === 'lounge' ? 0xec4899 : 0x475569)),
        metalness: 0.8,
        roughness: 0.2
      });
      const rimGeo = new THREE.BoxGeometry(zone.size[0], 0.06, 0.1);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(0, wallHeight, -zone.size[1] / 2);
      zoneGroup.add(rim);

      // Detailed Furniture by Zone Type
      if (zone.type === 'ceo') {
        // --- NAWAF EXECUTIVE SUITE ---
        // Luxury Executive Dark Walnut Desk
        const deskGeo = new THREE.BoxGeometry(4.6, 0.8, 2.0);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x1c130b, roughness: 0.25, metalness: 0.1 });
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(0, 0.45, -1.8);
        desk.castShadow = true;
        desk.userData = { isCeoDesk: true };
        zoneGroup.add(desk);

        // Gold Inlay Line on Desk
        const deskInlayGeo = new THREE.BoxGeometry(4.62, 0.02, 0.08);
        const deskInlayMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
        const deskInlay = new THREE.Mesh(deskInlayGeo, deskInlayMat);
        deskInlay.position.set(0, 0.86, -1.2);
        zoneGroup.add(deskInlay);

        // Nawaf CEO High-Back Executive Leather Throne
        const throneChairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 1.2), throneChairMat);
        seat.position.set(0, 0.5, -3.2);
        zoneGroup.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.22), throneChairMat);
        backrest.position.set(0, 1.3, -3.75);
        zoneGroup.add(backrest);

        // Gold Crown Hologram Emblem behind Chair
        const emblemRingGeo = new THREE.RingGeometry(1.2, 1.28, 32);
        const emblemRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
        const emblemRing = new THREE.Mesh(emblemRingGeo, emblemRingMat);
        emblemRing.position.set(0, 2.4, -4.7);
        zoneGroup.add(emblemRing);

        // Visitor Chairs facing desk
        [-1.4, 1.4].forEach((vx) => {
          const vSeat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.85), throneChairMat);
          vSeat.position.set(vx, 0.45, 0.2);
          zoneGroup.add(vSeat);

          const vBack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.12), throneChairMat);
          vBack.position.set(vx, 0.85, 0.6);
          zoneGroup.add(vBack);
        });

        // Executive Laptop / Terminal on Desk
        const laptopBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.04, 0.55),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
        );
        laptopBase.position.set(0, 0.87, -1.8);
        zoneGroup.add(laptopBase);

        const laptopScreen = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.5, 0.04),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        laptopScreen.position.set(0, 1.15, -2.05);
        laptopScreen.rotation.x = -0.2;
        zoneGroup.add(laptopScreen);

        // Decorative Luxury Planters (Ficus / Greenery)
        [-zone.size[0] / 2 + 1.2, zone.size[0] / 2 - 1.2].forEach((px) => {
          const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.3, 0.8, 16),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
          );
          pot.position.set(px, 0.45, -zone.size[1] / 2 + 1.2);
          zoneGroup.add(pot);

          const plant = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 })
          );
          plant.position.set(px, 1.0, -zone.size[1] / 2 + 1.2);
          zoneGroup.add(plant);
        });

      } else if (zone.type === 'boardroom') {
        // --- EXECUTIVE BOARDROOM ---
        // Grand Conference Table (Sleek elongated boat shape)
        const tableGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.7, 32);
        tableGeo.scale(1.9, 1, 1);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.4 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(0, 0.42, 0);
        table.castShadow = true;
        table.userData = { isBoardroomTable: true };
        zoneGroup.add(table);

        // Glowing Cyan Center LED Ribbon
        const ribbonGeo = new THREE.BoxGeometry(4.2, 0.02, 0.35);
        const ribbonMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.position.set(0, 0.78, 0);
        zoneGroup.add(ribbon);

        // 8 Conference Chairs
        const confChairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const cx = Math.cos(angle) * 3.4;
          const cz = Math.sin(angle) * 2.1;
          const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.7), confChairMat);
          chair.position.set(cx, 0.35, cz);
          chair.lookAt(zoneGroup.position.x, 0.35, zoneGroup.position.z);
          zoneGroup.add(chair);
        }

        // Wall Presentation Screen
        const screenGeo = new THREE.BoxGeometry(5.0, 2.2, 0.1);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x072235 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 2.0, -zone.size[1] / 2 + 0.12);
        zoneGroup.add(screen);

      } else if (zone.type === 'lounge') {
        // --- EXECUTIVE BREAKOUT LOUNGE ---
        // Curved Designer Sectional Sofa
        const sofaMat = new THREE.MeshStandardMaterial({ color: 0x33202a, roughness: 0.7 });
        
        // Main sofa bench
        const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 1.4), sofaMat);
        sofaMain.position.set(0, 0.3, -1.8);
        zoneGroup.add(sofaMain);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 0.4), sofaMat);
        sofaBack.position.set(0, 0.85, -2.5);
        zoneGroup.add(sofaBack);

        // Side armchair
        const sofaSide = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.2), sofaMat);
        sofaSide.position.set(-2.2, 0.3, -0.4);
        zoneGroup.add(sofaSide);

        // Modern Low Coffee Table
        const coffeeTable = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.35, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.2 })
        );
        coffeeTable.position.set(0, 0.22, -0.2);
        zoneGroup.add(coffeeTable);

        // Coffee Cups / Carafe on table
        const cup = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.08, 0.16, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
        );
        cup.position.set(0.4, 0.45, -0.2);
        zoneGroup.add(cup);

        // Espresso / Refreshment Counter along side
        const barCounter = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.95, 3.2),
          new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.3 })
        );
        barCounter.position.set(zone.size[0] / 2 - 1.2, 0.52, 0.8);
        barCounter.userData = { isLoungeBar: true };
        zoneGroup.add(barCounter);

        // Coffee Machine / Espresso Station
        const coffeeMachine = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.5, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.2 })
        );
        coffeeMachine.position.set(zone.size[0] / 2 - 1.2, 1.25, 0.8);
        zoneGroup.add(coffeeMachine);

        // Decorative potted plants
        const loungePlantPot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.25, 0.7, 16),
          new THREE.MeshStandardMaterial({ color: 0x1f2937 })
        );
        loungePlantPot.position.set(-zone.size[0] / 2 + 1.2, 0.4, zone.size[1] / 2 - 1.2);
        zoneGroup.add(loungePlantPot);

        const loungePlant = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x10b981 })
        );
        loungePlant.position.set(-zone.size[0] / 2 + 1.2, 0.9, zone.size[1] / 2 - 1.2);
        zoneGroup.add(loungePlant);

      } else {
        // --- DEPARTMENTAL WORKSTATIONS ---
        // Modern dual workstations with curved monitor setups
        const deskGeo = new THREE.BoxGeometry(3.6, 0.75, 1.5);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(0, 0.42, -0.6);
        desk.castShadow = true;
        zoneGroup.add(desk);

        // Dual High-Resolution Curved Displays
        [-0.8, 0.8].forEach((mx) => {
          const monGeo = new THREE.BoxGeometry(1.1, 0.65, 0.08);
          const monMat = new THREE.MeshBasicMaterial({ color: zone.glowColor });
          const mon = new THREE.Mesh(monGeo, monMat);
          mon.position.set(mx, 1.05, -0.6);
          zoneGroup.add(mon);
        });

        // Chairs for workstation
        [-0.8, 0.8].forEach((cx) => {
          const chair = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.45, 0.65),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
          );
          chair.position.set(cx, 0.35, 0.6);
          zoneGroup.add(chair);
        });

        // Specialized equipment based on department
        if (zone.id === 'systems') {
          // Dual Server Cabinets with activity lights
          const rackGeo = new THREE.BoxGeometry(1.4, 2.6, 1.2);
          const rackMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
          const rack = new THREE.Mesh(rackGeo, rackMat);
          rack.position.set(zone.size[0] / 2 - 1.2, 1.3, -zone.size[1] / 2 + 1.2);
          zoneGroup.add(rack);

          // Blinking rack LED strip
          const rackLed = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 2.0, 0.8),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          rackLed.position.set(zone.size[0] / 2 - 1.85, 1.3, -zone.size[1] / 2 + 1.2);
          zoneGroup.add(rackLed);
        } else if (zone.id === 'creative') {
          // Drawing tablet / design stand
          const tablet = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.05, 0.7),
            new THREE.MeshBasicMaterial({ color: 0xa855f7 })
          );
          tablet.position.set(-0.8, 0.82, -0.4);
          tablet.rotation.x = 0.25;
          zoneGroup.add(tablet);
        } else if (zone.id === 'pm') {
          // Agile Kanban Board on Back Wall
          const board = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 1.4, 0.08),
            new THREE.MeshBasicMaterial({ color: 0x1e3a8a })
          );
          board.position.set(0, 1.8, -zone.size[1] / 2 + 0.12);
          zoneGroup.add(board);
        }
      }

      scene.add(zoneGroup);
    });

    // 7. High-Fidelity Humanoid Android Robot Models
    const robotMeshes = new Map<string, {
      group: THREE.Group;
      currentPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      currentRot: number;
      targetRot: number;
      leftArm: THREE.Mesh;
      rightArm: THREE.Mesh;
      head: THREE.Group;
      visorMesh: THREE.Mesh;
      badgeMesh: THREE.Mesh;
      lightMesh: THREE.Mesh;
      emp: Employee;
      state: string;
      animOffset: number;
    }>();

    employees.forEach((emp, index) => {
      const robotGroup = new THREE.Group();
      robotGroup.userData = { isRobot: true, employeeId: emp.id };

      // Robot Torso (Sleek aerodynamic composite)
      const torsoGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.85, 16);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.7,
        roughness: 0.3
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.85;
      torso.castShadow = true;
      robotGroup.add(torso);

      // Glowing Arc Reactor Core on Chest
      const coreGeo = new THREE.SphereGeometry(0.11, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 0.95, 0.26);
      robotGroup.add(core);

      // Pelvis / Legs Base
      const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.35, 16);
      const pelvisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
      const pelvis = new THREE.Mesh(pelvisGeo, pelvisMat);
      pelvis.position.y = 0.35;
      robotGroup.add(pelvis);

      // Articulated Arms
      const armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });

      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.42, 0.8, 0);
      robotGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.42, 0.8, 0);
      robotGroup.add(rightArm);

      // Robot Head Group (for independent tilting/nodding)
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.48;

      const skullGeo = new THREE.SphereGeometry(0.26, 20, 20);
      const skullMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.2
      });
      const skull = new THREE.Mesh(skullGeo, skullMat);
      headGroup.add(skull);

      // Visor Eye Strip
      const visorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16, 1, false, 0, Math.PI);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.y = Math.PI / 2;
      visor.position.set(0, 0.02, 0.18);
      headGroup.add(visor);

      // Floating Holographic Status Halo
      const haloGeo = new THREE.RingGeometry(0.28, 0.34, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(0, 0.44, 0);
      headGroup.add(halo);

      robotGroup.add(headGroup);

      // Initial Placement
      const homeZone = ZONES.find(z => z.deptId === emp.departmentId) || ZONES[3];
      const initialPos = new THREE.Vector3(
        homeZone.pos[0] + (index % 2 === 0 ? -1.0 : 1.0) * 1.2,
        0.1,
        homeZone.pos[2] + 0.6
      );
      robotGroup.position.copy(initialPos);
      scene.add(robotGroup);

      robotMeshes.set(emp.id, {
        group: robotGroup,
        currentPos: initialPos.clone(),
        targetPos: initialPos.clone(),
        currentRot: 0,
        targetRot: 0,
        leftArm,
        rightArm,
        head: headGroup,
        visorMesh: visor,
        badgeMesh: halo,
        lightMesh: core,
        emp,
        state: emp.status,
        animOffset: index * 0.8
      });
    });

    // 8. Raycasting and Orbit State
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      robotMeshes,
      collaborationBeam: null,
      raycaster,
      mouse,
      animFrameId: 0,
      disposed: false,
      isOrbiting: false,
      lastMouseX: 0,
      lastMouseY: 0,
      currentLookAt,
      targetLookAt,
      spherical,
      targetSpherical
    };

    // 9. Master 60FPS Cinematic Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      if (sceneRef.current?.disposed) return;
      sceneRef.current!.animFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Smooth Camera Damping (Spherical Orbit interpolation)
      if (sceneRef.current) {
        const ref = sceneRef.current;
        ref.spherical.radius += (ref.targetSpherical.radius - ref.spherical.radius) * 0.08;
        ref.spherical.theta += (ref.targetSpherical.theta - ref.spherical.theta) * 0.08;
        ref.spherical.phi += (ref.targetSpherical.phi - ref.spherical.phi) * 0.08;

        ref.currentLookAt.lerp(ref.targetLookAt, 0.08);

        const sinPhiRad = ref.spherical.radius * Math.sin(ref.spherical.phi);
        camera.position.x = ref.currentLookAt.x + sinPhiRad * Math.sin(ref.spherical.theta);
        camera.position.y = ref.currentLookAt.y + ref.spherical.radius * Math.cos(ref.spherical.phi);
        camera.position.z = ref.currentLookAt.z + sinPhiRad * Math.cos(ref.spherical.theta);
        camera.lookAt(ref.currentLookAt);
      }

      // Rotate Central Holographic Gem & Data Rings
      if (holoGem) {
        holoGem.rotation.y = time * 0.8;
        holoGem.rotation.x = Math.sin(time * 0.5) * 0.18;
        holoGem.position.y = 2.0 + Math.sin(time * 2.0) * 0.12;
      }
      if (dataRing) {
        dataRing.rotation.z = -time * 0.6;
        dataRing.rotation.x = Math.PI / 3 + Math.sin(time * 0.4) * 0.15;
      }

      // Robot State-Based Animations (Walk, Work, Collaborate, Breathe)
      robotMeshes.forEach((item) => {
        const dist = item.currentPos.distanceTo(item.targetPos);
        const isWalking = dist > 0.1;

        // Smooth Position Lerp
        item.currentPos.lerp(item.targetPos, 0.065);

        // Calculate Walk Heading
        if (isWalking) {
          const angle = Math.atan2(
            item.targetPos.x - item.currentPos.x,
            item.targetPos.z - item.currentPos.z
          );
          item.targetRot = angle;
          // Walk Bob
          const walkCycle = time * 8.0 + item.animOffset;
          item.group.position.y = item.currentPos.y + Math.abs(Math.sin(walkCycle)) * 0.08;
          // Arm swing while walking
          item.leftArm.rotation.x = Math.sin(walkCycle) * 0.5;
          item.rightArm.rotation.x = -Math.sin(walkCycle) * 0.5;
        } else {
          // Idle / Working / State-specific gestures
          item.group.position.y = item.currentPos.y + Math.sin(time * 2.2 + item.animOffset) * 0.03;

          if (item.state === 'COLLABORATING') {
            // Gesturing and conversing
            item.leftArm.rotation.x = Math.sin(time * 3.5 + item.animOffset) * 0.3 + 0.4;
            item.rightArm.rotation.x = Math.cos(time * 3.0 + item.animOffset) * 0.3 + 0.4;
            item.head.rotation.y = Math.sin(time * 2.0 + item.animOffset) * 0.25;
            item.head.rotation.x = Math.sin(time * 1.5 + item.animOffset) * 0.1;
          } else if (item.state === 'MEETING') {
            // Seated meeting posture: subtle nodding
            item.leftArm.rotation.x = 0.6;
            item.rightArm.rotation.x = 0.6;
            item.head.rotation.x = Math.sin(time * 1.8 + item.animOffset) * 0.08;
            item.head.rotation.y = Math.sin(time * 0.9 + item.animOffset) * 0.15;
          } else if (item.state === 'ينتظر قرارك' || item.state === 'WAITING_FOR_NAWAF') {
            // Standing with alert posture, looking slightly up
            item.leftArm.rotation.x = 0.1;
            item.rightArm.rotation.x = 0.1;
            item.head.rotation.x = -0.15; // looking up towards CEO
            item.head.rotation.y = Math.sin(time * 1.2) * 0.05;
          } else if (item.state === 'WORKING' || item.state === 'يعمل الآن' || item.state === 'يطور' || item.state === 'يصمم') {
            // Animate work gestures only when the recorded state says the employee is working.
            item.leftArm.rotation.x = 0.7 + Math.sin(time * 6.0 + item.animOffset) * 0.12;
            item.rightArm.rotation.x = 0.7 + Math.cos(time * 6.0 + item.animOffset) * 0.12;
            item.head.rotation.x = 0.2;
          } else {
            // READY/unknown states stay visually neutral; do not imply work that did not happen.
            item.leftArm.rotation.x = 0.05;
            item.rightArm.rotation.x = 0.05;
            item.head.rotation.x = 0;
            item.head.rotation.y = 0;
          }
        }

        // Smooth Rotation Lerp
        let diff = item.targetRot - item.currentRot;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        item.currentRot += diff * 0.08;
        item.group.rotation.y = item.currentRot;

        item.group.position.x = item.currentPos.x;
        item.group.position.z = item.currentPos.z;

        // Halo gentle hover spin
        item.badgeMesh.rotation.z = time * 1.5;
      });

      // Project 3D Zone positions to 2D HTML Screen Coordinates
      const newScreens = ZONES.map((zone) => {
        const vec = new THREE.Vector3(zone.pos[0], 2.4, zone.pos[2]);
        vec.project(camera);
        const x = (vec.x * 0.5 + 0.5) * width;
        const y = (-vec.y * 0.5 + 0.5) * height;
        return {
          id: zone.id,
          x,
          y,
          visible: vec.z < 1.0
        };
      });
      setZoneScreens(newScreens);

      renderer.render(scene, camera);
    };

    sceneRef.current.animFrameId = requestAnimationFrame(animate);

    // Mouse Drag Controls for Smooth Cinematic Orbit
    const handleMouseDown = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      sceneRef.current.isOrbiting = true;
      sceneRef.current.lastMouseX = e.clientX;
      sceneRef.current.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current || !mount) return;
      const rect = mount.getBoundingClientRect();
      sceneRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      sceneRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (sceneRef.current.isOrbiting) {
        const deltaX = e.clientX - sceneRef.current.lastMouseX;
        const deltaY = e.clientY - sceneRef.current.lastMouseY;
        sceneRef.current.lastMouseX = e.clientX;
        sceneRef.current.lastMouseY = e.clientY;

        sceneRef.current.targetSpherical.theta -= deltaX * 0.005;
        sceneRef.current.targetSpherical.phi = Math.max(0.4, Math.min(1.45, sceneRef.current.targetSpherical.phi - deltaY * 0.005));
      }

      // Check Hover over Robots
      raycaster.setFromCamera(sceneRef.current.mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let hitEmp: Employee | null = null;

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData?.isRobot && curr.userData?.employeeId) {
            const empObj = employees.find(emp => emp.id === curr!.userData.employeeId);
            if (empObj) hitEmp = empObj;
            break;
          }
          curr = curr.parent;
        }
        if (hitEmp) break;
      }
      setHoveredRobot(hitEmp);
    };

    const handleMouseUp = () => {
      if (sceneRef.current) sceneRef.current.isOrbiting = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (!sceneRef.current || !mount) return;
      const rect = mount.getBoundingClientRect();
      sceneRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      sceneRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(sceneRef.current.mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData?.isRobot && curr.userData?.employeeId) {
            const empObj = employees.find(emp => emp.id === curr!.userData.employeeId);
            if (empObj) {
              setSelectedEmployee(empObj);
              return;
            }
          }
          if (curr.userData?.isCeoDesk) {
            setIsCeoCommandOpen(true);
            return;
          }
          if (curr.userData?.isBoardroomTable) {
            setIsMeetingModalOpen(true);
            return;
          }
          if (curr.userData?.isLoungeBar) {
            focusOnZone('lounge');
            return;
          }
          curr = curr.parent;
        }
      }
    };

    // Resize Observer with safe dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0 && sceneRef.current) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mount);

    // Tab visibility handling for smooth CPU/GPU efficiency
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (sceneRef.current?.animFrameId) {
          cancelAnimationFrame(sceneRef.current.animFrameId);
        }
      } else {
        if (sceneRef.current && !sceneRef.current.disposed) {
          clock.start();
          sceneRef.current.animFrameId = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('click', handleClick);

    // Cleanup & Resource Disposal
    return () => {
      if (sceneRef.current) {
        sceneRef.current.disposed = true;
        cancelAnimationFrame(sceneRef.current.animFrameId);
      }
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('click', handleClick);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  // Synchronize Employee Robot States and Positions
  useEffect(() => {
    if (!sceneRef.current) return;
    const { robotMeshes } = sceneRef.current;

    employees.forEach((emp, empIdx) => {
      const item = robotMeshes.get(emp.id);
      if (!item) return;

      item.emp = emp;
      item.state = emp.status;

      const homeZone = ZONES.find(z => z.deptId === emp.departmentId) || ZONES[3];
      let targetX = homeZone.pos[0] + (empIdx % 2 === 0 ? -1.2 : 1.2);
      let targetZ = homeZone.pos[2] + 0.6;
      let targetRot = 0; // facing desk

      // 1. If in MEETING -> Move physically to Boardroom chairs around table!
      if (emp.status === 'MEETING' || (meetingSession && meetingSession.attendees.includes(emp.id))) {
        const meetZone = ZONES.find(z => z.id === 'boardroom')!;
        const angle = (empIdx / Math.max(employees.length, 6)) * Math.PI * 2;
        targetX = meetZone.pos[0] + Math.cos(angle) * 3.2;
        targetZ = meetZone.pos[2] + Math.sin(angle) * 1.9;
        targetRot = angle + Math.PI; // Face inward towards table
      }
      // 2. If WAITING_FOR_NAWAF -> Move physically to Nawaf's Executive Anteroom!
      else if (emp.status === 'ينتظر قرارك' || emp.status === 'WAITING_FOR_NAWAF') {
        const ceoZone = ZONES.find(z => z.id === 'ceo')!;
        targetX = ceoZone.pos[0] + (empIdx % 2 === 0 ? -1.2 : 1.2);
        targetZ = ceoZone.pos[2] + 2.5; // Standing in front of the executive desk
        targetRot = Math.PI; // Face the CEO desk
      }
      // 3. If COLLABORATING -> Move to central atrium or lounge
      else if (emp.status === 'COLLABORATING') {
        const angle = (empIdx * (Math.PI / 3));
        targetX = Math.cos(angle) * 2.8;
        targetZ = Math.sin(angle) * 2.8;
        targetRot = angle + Math.PI; // Face each other
      }
      // 4. If IDLE or BREAK -> Relax in the Executive Lounge
      else if (emp.status === 'متوقف مؤقتًا' || emp.status === 'BLOCKED') {
        const loungeZone = ZONES.find(z => z.id === 'lounge')!;
        targetX = loungeZone.pos[0] + (empIdx % 2 === 0 ? -1.0 : 1.0);
        targetZ = loungeZone.pos[2] + 0.5;
        targetRot = 0;
      }

      item.targetPos.set(targetX, 0.1, targetZ);
      item.targetRot = targetRot;

      // Color coding for status
      let haloColor = 0x10b981; // working: emerald
      let visorColor = 0x38bdf8; // cyan

      if (emp.status === 'ينتظر قرارك' || emp.status === 'WAITING_FOR_NAWAF') {
        haloColor = 0xf59e0b; // amber
        visorColor = 0xfbbf24;
      } else if (emp.status === 'MEETING') {
        haloColor = 0x06b6d4; // cyan
        visorColor = 0x22d3ee;
      } else if (emp.status === 'COLLABORATING') {
        haloColor = 0xa855f7; // purple
        visorColor = 0xc084fc;
      } else if (emp.status === 'متوقف مؤقتًا' || emp.status === 'BLOCKED') {
        haloColor = 0x64748b; // slate
        visorColor = 0x94a3b8;
      }

      if (item.badgeMesh.material instanceof THREE.MeshBasicMaterial) {
        item.badgeMesh.material.color.setHex(haloColor);
      }
      if (item.visorMesh.material instanceof THREE.MeshBasicMaterial) {
        item.visorMesh.material.color.setHex(visorColor);
      }
    });
  }, [employees, meetingSession]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl border border-white/10 overflow-hidden select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-[#060913]' : 'min-h-[600px] lg:min-h-[680px]'
      }`}
    >
      {/* 1. Header Overlay: Status & Zone Navigation Pills */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        
        {/* Left: HQ Identity */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400/60"></span>
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <span>مقر شركة نواف الذكية</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 font-mono text-[11px]">NAWAF 3D HQ</span>
          </span>
        </div>

        {/* Center: Camera Zone Switcher Pills */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 text-xs">
          <button
            onClick={() => focusOnZone('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeZoneView === 'all' 
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المقر كاملاً
          </button>
          <button
            onClick={() => focusOnZone('ceo')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeZoneView === 'ceo' 
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑</span>
            <span>مكتب نواف</span>
          </button>
          <button
            onClick={() => focusOnZone('boardroom')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeZoneView === 'boardroom' 
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👥</span>
            <span>قاعة الاجتماعات</span>
          </button>
          <button
            onClick={() => focusOnZone('lounge')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeZoneView === 'lounge' 
                ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>☕</span>
            <span>استراحة الابتكار</span>
          </button>
          <button
            onClick={() => focusOnZone('systems')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeZoneView === 'systems' 
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الهندسة
          </button>
          <button
            onClick={() => focusOnZone('creative')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeZoneView === 'creative' 
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            التصميم
          </button>
          <button
            onClick={() => focusOnZone('pm')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeZoneView === 'pm' 
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            العمليات
          </button>
        </div>

        {/* Right: Camera Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">

          <button
            onClick={() => zoomCamera(-6)}
            title="تقريب الكاميرا"
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-200 border border-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => zoomCamera(6)}
            title="إبعاد الكاميرا"
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-200 border border-white/10"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => focusOnZone('all')}
            title="إعادة ضبط المنظور"
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-200 border border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="عرض كامل الشاشة"
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-white border border-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* 2. 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[600px] lg:min-h-[680px] cursor-grab active:cursor-grabbing bg-[#060913]"
      />

      {/* 3. Interactive Floating Zone Badges in 3D Space */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {zoneScreens.map((s) => {
          const zone = ZONES.find(z => z.id === s.id);
          if (!zone || !s.visible) return null;

          return (
            <div
              key={zone.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-auto"
              style={{ left: `${s.x}px`, top: `${s.y}px` }}
            >
              <button
                onClick={() => {
                  if (zone.type === 'ceo') {
                    setIsCeoCommandOpen(true);
                  } else if (zone.type === 'boardroom') {
                    setIsMeetingModalOpen(true);
                  } else if (zone.type === 'lounge') {
                    focusOnZone('lounge');
                  } else if (zone.deptId) {
                    const dept = departments.find(d => d.id === zone.deptId);
                    if (dept) setSelectedDepartment(dept);
                  }
                }}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md border text-xs font-bold transition-all shadow-xl hover:scale-105 ${
                  zone.type === 'ceo'
                    ? 'bg-amber-950/85 text-amber-200 border-amber-500/40 hover:bg-amber-900'
                    : zone.type === 'boardroom'
                    ? 'bg-cyan-950/85 text-cyan-200 border-cyan-500/40 hover:bg-cyan-900'
                    : zone.type === 'lounge'
                    ? 'bg-pink-950/85 text-pink-200 border-pink-500/40 hover:bg-pink-900'
                    : 'bg-slate-950/85 text-slate-200 border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <span>{zone.icon}</span>
                <span>{zone.arabicName}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. Hovered Employee Quick Tooltip */}
      {hoveredRobot && (
        <div className="absolute bottom-20 right-6 z-20 pointer-events-auto p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl text-right max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">{hoveredRobot.avatar}</span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{hoveredRobot.name}</span>
                <span className="text-[10px] text-cyan-400">({hoveredRobot.position})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                الحالة: {hoveredRobot.status}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-white/5">
            {hoveredRobot.currentTask}
          </p>

          <button
            onClick={() => setSelectedEmployee(hoveredRobot)}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            فتح لوحة الوكيل والتوجيه
          </button>
        </div>
      )}

      {/* 5. Executive Floating Bottom Dock */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        
        {/* Team Presence Strip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-xl overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-medium ml-1 shrink-0">حالة الفريق:</span>
          {employees.slice(0, 8).map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              title={`${emp.name} (${emp.position}) - اضغط للتوجيه`}
              className="relative group p-1.5 rounded-xl hover:bg-slate-800 transition-all shrink-0"
            >
              <span className="text-lg">{emp.avatar}</span>
              <span 
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-950 ${
                  emp.status === 'ينتظر قرارك' || emp.status === 'WAITING_FOR_NAWAF'
                    ? 'bg-amber-400'
                    : emp.status === 'MEETING'
                      ? 'bg-cyan-400'
                      : ['WORKING', 'يعمل الآن', 'يطور', 'يصمم'].includes(emp.status)
                        ? 'bg-emerald-400'
                        : 'bg-slate-500'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Quick CEO Directives & Approvals Alerts */}
        <div className="flex items-center gap-2">
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => focusOnZone('ceo')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all shadow-lg flex items-center gap-2 animate-pulse"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{pendingApprovalsCount} قرارات تنتظر اعتمادك في مكتبك</span>
            </button>
          )}

          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all shadow-md flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>عقد اجتماع فوري</span>
          </button>

          <button
            onClick={() => setIsCeoCommandOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            <span>إصدار توجيه تنفيذي</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default InteractiveOffice;
