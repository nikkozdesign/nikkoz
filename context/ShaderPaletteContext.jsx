"use client";

import { createContext, useContext, useState, useCallback } from "react";

const PALETTES = [
  {
    name: "green",
    color1: "#06070F",
    color2: "#000000",
    color3: "#005735",
    color4: "#1BBB93",
  },
  {
    name: "violet",
    color1: "#0a0420",
    color2: "#000000",
    color3: "#2a0e5e",
    color4: "#a855f7",
  },
];

const ShaderPaletteContext = createContext({
  paletteIndex: 0,
  palette: PALETTES[0],
  nextPalette: () => {},
});

const ShaderPaletteProvider = ({ children }) => {
  const [paletteIndex, setPaletteIndex] = useState(0);

  const nextPalette = useCallback(() => {
    setPaletteIndex((i) => (i + 1) % PALETTES.length);
  }, []);

  return (
    <ShaderPaletteContext.Provider
      value={{ paletteIndex, palette: PALETTES[paletteIndex], nextPalette }}
    >
      {children}
    </ShaderPaletteContext.Provider>
  );
};

const useShaderPalette = () => useContext(ShaderPaletteContext);

export { PALETTES, ShaderPaletteProvider, useShaderPalette };
