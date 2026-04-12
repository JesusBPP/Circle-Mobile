import React from 'react';
// 🌟 Importamos las familias adicionales de íconos que trae Expo
import { Ionicons, AntDesign, EvilIcons, Entypo, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
/**
 * 📄 DESCRIPCIÓN DEL ARCHIVO: Icons.tsx
 * ----------------------------------------------------------------------------------
 * Biblioteca centralizada de íconos para el ecosistema CIRCLE (React Native / Expo).
 * ----------------------------------------------------------------------------------
 */

// --- Figuras Geométricas ---
export const IconCircleShape = (props: any) => <Ionicons name="ellipse" {...props} />;
export const IconSquareShape = (props: any) => <Ionicons name="square" {...props} />;
export const IconTriangleShape = (props: any) => <Ionicons name="triangle" {...props} />;
// 🌟 Hexágono nativo desde MaterialCommunityIcons
export const IconHexagon = (props: any) => <MaterialCommunityIcons name="hexagon" {...props} />;
export const IconHexagonOutline = (props: any) => <MaterialCommunityIcons name="hexagon-outline" {...props} />;

// =========================================================
// --- SECUENCIA DE ÍCONOS PARA ANIMACIÓN (Círculos) ---
// =========================================================
export const IconRise = (props: any) => <AntDesign name="rise" {...props} />;
export const IconBulb = (props: any) => <AntDesign name="bulb" {...props} />;
export const IconContacts = (props: any) => <AntDesign name="contacts" {...props} />;
export const IconContainer = (props: any) => <AntDesign name="container" {...props} />;
export const IconControl = (props: any) => <AntDesign name="control" {...props} />;
export const IconPieChart = (props: any) => <AntDesign name="pie-chart" {...props} />;
export const IconProduct = (props: any) => <AntDesign name="product" {...props} />;
export const IconShop = (props: any) => <AntDesign name="shop" {...props} />;
export const IconSmile = (props: any) => <AntDesign name="smile" {...props} />;
export const IconStar = (props: any) => <AntDesign name="star" {...props} />;
export const IconThunderbolt = (props: any) => <AntDesign name="thunderbolt" {...props} />;
export const IconLocation = (props: any) => <EvilIcons name="location" {...props} />;
export const IconTool = (props: any) => <AntDesign name="tool" {...props} />;
export const Icon500px = (props: any) => <Entypo name="500px" {...props} />;
export const IconAreaGraph = (props: any) => <Entypo name="area-graph" {...props} />;

// =========================================================
// --- ÍCONOS DE INTERFAZ GENERAL ---
// =========================================================
export const IconRadial = (props: any) => <Ionicons name="aperture-outline" {...props} />; 
export const IconBusinessConfig = (props: any) => <Ionicons name="briefcase-outline" {...props} />;
export const IconRocket = (props: any) => <Ionicons name="rocket-outline" {...props} />;
export const IconList = (props: any) => <Ionicons name="list-outline" {...props} />;
export const IconChevronDown = (props: any) => <Ionicons name="chevron-down" {...props} />;
export const IconChevronRight = (props: any) => <Ionicons name="chevron-forward" {...props} />;
export const IconLogout = (props: any) => <Ionicons name="log-out-outline" {...props} />;
export const IconSandbox = (props: any) => <Ionicons name="construct-outline" {...props} />;
export const IconButtonLayout = (props: any) => <Ionicons name="browsers-outline" {...props} />; 
export const IconContrast = (props: any) => <Ionicons name="contrast-outline" {...props} />;

// --- ÍCONOS PARA LA BIBLIOTECA DE BOTONES ---
export const IconMusic = (props: any) => <Ionicons name="musical-notes" {...props} />;
export const IconPower = (props: any) => <Ionicons name="power" {...props} />;
export const IconPlus = (props: any) => <AntDesign name="plus" {...props} />;
export const IconDownload = (props: any) => <Feather name="download" {...props} />;
export const IconHeart = (props: any) => <Ionicons name="heart" {...props} />;
export const IconGear = (props: any) => <Ionicons name="settings-sharp" {...props} />;
export const IconSearch = (props: any) => <Ionicons name="search" {...props} />;
export const IconHome = (props: any) => <Ionicons name="home" {...props} />;
export const IconWifi = (props: any) => <Ionicons name="wifi" {...props} />;
export const IconBluetooth = (props: any) => <Ionicons name="bluetooth" {...props} />;
export const IconShield = (props: any) => <Ionicons name="shield-checkmark" {...props} />;
export const IconAirplane = (props: any) => <Ionicons name="airplane" {...props} />;
export const IconData = (props: any) => <MaterialIcons name="cell-wifi" {...props} />;
export const IconLogin = (props: any) => <Ionicons name="log-in-outline" {...props} />;