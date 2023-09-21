# ASCII

An ASCII effect for THREE.js - which runs as a fragment shader on the GPU.

### Supported Props

```typescript
interface IASCIIEffectProps {
    characters?: string; // The ASCII characters to use in brightness order dark -> light
    fontSize?: number; // Font Size of the characters drawn to the texture
    cellSize?: number; // Size of each cell in the grid
    blockSize?: number; // Cluster size of each cell
    invert?: boolean; // Flag which inverts the effect
    fgColor?: string; // Color of the characters
    bgColor?: string; // Background color of the cells.
    useColorArray?: boolean; // Flag to toggle custom color array use
    colorArray?: string[]; // Provide a custom color array to use
    useOriginalColors?: boolean; // Flag to use whatever original colors drive the shader
    brightness?: number;
    charAspectRatio?: number; // Stretch characters over the X axis.
    disabled?: boolean; // Disable the effect
}
```

### Example with @react-three/fiber

```jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';

const Scene = () => {
    const asciiEffect = React.useMemo(() => new ASCIIEffect(), []);

    return (
        <Canvas>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhongMaterial />
            </mesh>
            <pointLight position={[0, 0, 10]} />
            <EffectComposer>
                <primitive object={asciiEffect} />
            </EffectComposer>
        </Canvas>
    );
};
```
