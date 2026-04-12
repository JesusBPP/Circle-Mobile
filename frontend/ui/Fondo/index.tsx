import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { IconHexagon } from '../Icons'; 
import { styles, colors } from './styles';

export type TipoFondo = 'default' | 'dark' | 'pattern-dark' | 'pattern-light';

interface FondoManagerProps {
  tipoFondo: TipoFondo;
  children: React.ReactNode; 
}

export const FondoManager = ({ tipoFondo, children }: FondoManagerProps) => {
  const { width, height } = Dimensions.get('window');
  const isPattern = tipoFondo === 'pattern-dark' || tipoFondo === 'pattern-light';
  const isDarkPattern = tipoFondo === 'pattern-dark';

  // ==========================================
  // GENERADOR DE TRAYECTORIAS ALEATORIAS
  // ==========================================
  const generateRandomPaths = () => {
    return Array.from({ length: 5 }).map(() => {
      // 50% de probabilidad de cruzar horizontal o verticalmente
      const isHorizontal = Math.random() > 0.5;
      let startX = 0, startY = 0, endX = 0, endY = 0;

      if (isHorizontal) {
        // Inicia izquierda o derecha, fuera de la pantalla
        startX = Math.random() > 0.5 ? -400 : width + 400;
        endX = startX === -400 ? width + 400 : -400;
        // Altura aleatoria
        startY = Math.random() * (height + 400) - 200;
        endY = Math.random() * (height + 400) - 200;
      } else {
        // Inicia arriba o abajo, fuera de la pantalla
        startY = Math.random() > 0.5 ? -400 : height + 400;
        endY = startY === -400 ? height + 400 : -400;
        // Anchura aleatoria
        startX = Math.random() * (width + 400) - 200;
        endX = Math.random() * (width + 400) - 200;
      }
      return { startX, startY, endX, endY };
    });
  };

  // ==========================================
  // ESTADOS Y REFERENCIAS DE ANIMACIÓN
  // ==========================================
  const [networkData, setNetworkData] = useState<{nodes: any[], connections: any[]}>({ nodes: [], connections: [] });
  // 🌟 Guardamos las trayectorias aleatorias en el estado
  const [polyPaths, setPolyPaths] = useState<any[]>(generateRandomPaths());
  
  const orbitAnim = useRef(new Animated.Value(0)).current;
  
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;
  const drift3 = useRef(new Animated.Value(0)).current;
  const drift4 = useRef(new Animated.Value(0)).current;
  const drift5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPattern) return;

    // 1. GENERACIÓN DE RED NEURONAL
    const numNodes = Math.floor(Math.random() * 5) + 18; 
    const newNodes = Array.from({ length: numNodes }).map((_, i) => ({
      id: i, x: Math.random() * 0.9 + 0.05, y: Math.random() * 0.9 + 0.05,
    }));
    const newConns: string[] = [];
    newNodes.forEach((node, i) => {
      let dists = newNodes.map((other, j) => ({ j, d: Math.hypot(node.x - other.x, node.y - other.y) })).filter(d => d.j !== i);
      dists.sort((a, b) => a.d - b.d);
      for(let k = 0; k < 2; k++) {
        let target = dists[k].j;
        let min = Math.min(i, target); let max = Math.max(i, target);
        let pair = `${min}-${max}`;
        if(!newConns.includes(pair)) newConns.push(pair);
      }
    });
    setNetworkData({ nodes: newNodes, connections: newConns.map(c => [parseInt(c.split('-')[0]), parseInt(c.split('-')[1])]) });

    // 🌟 Generamos nuevas rutas cada vez que carga el fondo
    setPolyPaths(generateRandomPaths());

    // 2. INICIAR ANIMACIONES
    orbitAnim.setValue(0); drift1.setValue(0); drift2.setValue(0); drift3.setValue(0); drift4.setValue(0); drift5.setValue(0);

    const loopAnim = (anim: Animated.Value, duration: number) => {
      Animated.loop(Animated.timing(anim, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })).start();
    };

    loopAnim(orbitAnim, 25000); 
    loopAnim(drift1, 28000);    
    loopAnim(drift2, 35000);    
    loopAnim(drift3, 40000);    
    loopAnim(drift4, 32000);    
    loopAnim(drift5, 26000);    

  }, [tipoFondo]); 

  // ==========================================
  // CONFIGURACIÓN DINÁMICA DE COLORES (Tus Cambios)
  // ==========================================
  const netLineColor = isDarkPattern ? 'rgba(15, 83, 186, 0.31)' : 'rgba(0, 71, 171, 0.3)'; 
  const netNodeColor = isDarkPattern ? colors.sapphire : colors.cobaltBlue;
  
  const polyMain = isDarkPattern ? 'rgba(238, 240, 239, 0.9)' : 'rgba(89, 182, 194, 0.38)';
  const polySec  = isDarkPattern ? 'rgba(207, 207, 207, 0.93)' : 'rgba(226, 181, 240, 0.53)';

  // ==========================================
  // RENDERIZADO MATEMÁTICO DE LA RED
  // ==========================================
  const renderedNetwork = useMemo(() => {
    if (networkData.nodes.length === 0) return null;

    const lines = networkData.connections.map((conn, index) => {
      const n1 = networkData.nodes[conn[0]]; const n2 = networkData.nodes[conn[1]];
      const x1 = n1.x * width; const y1 = n1.y * height; const x2 = n2.x * width; const y2 = n2.y * height;
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      return (
        <View key={`line-${index}`} style={[styles.neuralLine, { width: length, left: ((x1 + x2) / 2) - length / 2, top: (y1 + y2) / 2, transform: [{ rotate: `${angle}deg` }], backgroundColor: netLineColor }]} />
      );
    });

    const renderedNodes = networkData.nodes.map(node => (
      <View key={`node-${node.id}`} style={[styles.neuralNode, { left: node.x * width - 3, top: node.y * height - 3, backgroundColor: netNodeColor, shadowColor: netNodeColor }]} />
    ));

    return { lines, renderedNodes };
  }, [networkData, width, height, netLineColor, netNodeColor]);

  // ==========================================
  // INTERPOLACIONES DE MOVIMIENTO
  // ==========================================
  const orbitX = orbitAnim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 20, 0, -20, 0] });
  const orbitY = orbitAnim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [-20, 0, 20, 0, -20] });

  // 🌟 Asignamos dinámicamente el inicio y el fin basándonos en las trayectorias calculadas
  const getInterp = (anim: Animated.Value, index: number, axis: 'X' | 'Y') => {
    return anim.interpolate({
      inputRange: [0, 1],
      outputRange: [polyPaths[index][`start${axis}`], polyPaths[index][`end${axis}`]]
    });
  };

  const t1X = getInterp(drift1, 0, 'X'); const t1Y = getInterp(drift1, 0, 'Y');
  const t2X = getInterp(drift2, 1, 'X'); const t2Y = getInterp(drift2, 1, 'Y');
  const t3X = getInterp(drift3, 2, 'X'); const t3Y = getInterp(drift3, 2, 'Y');
  const t4X = getInterp(drift4, 3, 'X'); const t4Y = getInterp(drift4, 3, 'Y');
  const t5X = getInterp(drift5, 4, 'X'); const t5Y = getInterp(drift5, 4, 'Y');

  const getBackgroundStyle = () => {
    switch (tipoFondo) {
      case 'dark': return styles.background_Dark;
      case 'pattern-dark': return styles.background_PatternDark;
      case 'pattern-light': return styles.background_PatternLight;
      case 'default': default: return styles.background_Default;
    }
  };

  return (
    <View style={[styles.wrapper, getBackgroundStyle()]}>
      
      {isPattern && (
        <View style={StyleSheet.absoluteFill}>
          
          <Animated.View style={[styles.floatCircle, { width: 350, height: 350, backgroundColor: polyMain, transform: [{translateX: t1X}, {translateY: t1Y}] }]} />
          <Animated.View style={[styles.floatCircle, { width: 250, height: 250, backgroundColor: polySec, transform: [{translateX: t2X}, {translateY: t2Y}] }]} />
          
          <Animated.View style={{ position: 'absolute', transform: [{translateX: t3X}, {translateY: t3Y}] }}>
            <IconHexagon size={200} color={polyMain} />
          </Animated.View>

          <Animated.View style={{ position: 'absolute', transform: [{translateX: t4X}, {translateY: t4Y}] }}>
            <IconHexagon size={150} color={polySec} />
          </Animated.View>

          <Animated.View style={{ position: 'absolute', transform: [{translateX: t5X}, {translateY: t5Y}] }}>
            <IconHexagon size={100} color={polySec} />
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{translateX: orbitX}, {translateY: orbitY}] }]}>
            {renderedNetwork?.lines}
            {renderedNetwork?.renderedNodes}
          </Animated.View>
          
        </View>
      )}

      <View style={{ flex: 1, zIndex: 10 }}>
        {children}
      </View>
    </View>
  );
};