import React from 'react';
// 🌟 Importamos las familias adicionales de íconos que trae Expo
import { Ionicons, AntDesign, EvilIcons, Entypo } from '@expo/vector-icons';

/**
 * 📄 DESCRIPCIÓN DEL ARCHIVO: Icons.tsx
 * ----------------------------------------------------------------------------------
 * Biblioteca centralizada de íconos para el ecosistema CIRCLE (React Native / Expo).
 * ----------------------------------------------------------------------------------
 */

// --- Figuras Geométricas (Mantenidas por si acaso) ---
export const IconCircleShape = (props: any) => <Ionicons name="ellipse" {...props} />;
export const IconSquareShape = (props: any) => <Ionicons name="square" {...props} />;
export const IconTriangleShape = (props: any) => <Ionicons name="triangle" {...props} />;

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
// --- ÍCONOS DE INTERFAZ GENERAL (Sandbox y Acordeones) ---
// =========================================================
// Ícono perfecto para representar un menú radial o algo circular
export const IconRadial = (props: any) => <Ionicons name="aperture-outline" {...props} />; 
export const IconBusinessConfig = (props: any) => <Ionicons name="briefcase-outline" {...props} />;
export const IconRocket = (props: any) => <Ionicons name="rocket-outline" {...props} />;
export const IconList = (props: any) => <Ionicons name="list-outline" {...props} />;
export const IconChevronDown = (props: any) => <Ionicons name="chevron-down" {...props} />;