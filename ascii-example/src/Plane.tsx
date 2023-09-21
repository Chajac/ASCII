import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const fS = `

    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uOffset;
    
    void main() {

        vec2 fragCoordNormalized = gl_FragCoord.xy;  // Normalized pixel coordinates
        float animationSpeed = 0.322205;                 // Speed of animation
        float scaleFactor = 0.004599;                   // Scaling factor for pixel coordinates
        vec2 scaledCoords = fragCoordNormalized * scaleFactor;
        
        float basePhase = cos(uTime *0.00821205);
        float thirdHarmonicAmplitude = uTime * .0001;
        float fourthHarmonicAmplitude = uTime *1.0010211;
        float totalVariance = basePhase + (0.0 * basePhase * (0.0033 * thirdHarmonicAmplitude))
                            + (0.003* basePhase * (0.0205 * fourthHarmonicAmplitude));
        
        for (int harmonic = 1; harmonic <3; harmonic++) {

        
            // Update the scaled coordinates using harmonic functions
            scaledCoords.x += (1.001 / float(harmonic)) * cos(float(totalVariance) * 2.2* scaledCoords.y + uTime * animationSpeed)
                            +  (uOffset * 0.345) / 1.0;
            scaledCoords.y += (3.1 / float(harmonic)) * floor(float(harmonic) *62.32 * scaledCoords.x + uTime * animationSpeed)
                            * (uOffset * 0.350) / 23.0;
        }
        
        // Calculate the RGB color components
        float red = cos(scaledCoords.x + scaledCoords.y + 5.0) * 0.42 + 0.3;
        float green = cos(scaledCoords.x + scaledCoords.y + 32.0) * 0.51 + 0.4;
        float blue = (sin(scaledCoords.x + scaledCoords.y) + cos(scaledCoords.x + scaledCoords.x)) * .03 + 0.25;
        vec3 finalColor = vec3(red, green, blue);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
    `;
const vS = `varying vec2 vUv;
    void main() {
        //assign all 3js uvs to the varying variable
    vUv = uv;
    //standard final vertex calculator 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

const Plane = (props: { offset: number }) => {
    const { size } = useThree();
    const uniforms = useMemo(
        () => ({ uResolution: new THREE.Vector2(size.width, size.height), uTime: 0.0, uOffset: props.offset }),
        [props.offset, size.height, size.width]
    );

    const ColorShiftMaterial = shaderMaterial(uniforms, vS, fS);
    //makes material accessible as a jsx component
    extend({ ColorShiftMaterial, shaderMaterial });
    const meshRef = useRef(null);
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10, 1, 1]} />
            <colorShiftMaterial key={ColorShiftMaterial.key} />
        </mesh>
    );
};

export default Plane;
