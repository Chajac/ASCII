import { Canvas, useThree } from '@react-three/fiber';
import './App.css';
import { EffectComposer } from '@react-three/postprocessing';
import { ASCIIEffect, IASCIIEffectProps } from './Asciieffect/index';
import { forwardRef, useMemo } from 'react';
import { useControls, folder } from 'leva';
import Plane from './Plane';

// Extract canvas width and height
function App() {
    const guiConfig = useControls({
        ASCIIEffect: folder({
            characters: ` .,'^:-=+*?!|0%#XWM@`,
            fontSize: { value: 54, step: 1 },
            cellSize: 16,
            blockSize: 1,
            charAspectRatio: 1,
            bgColor: '#000000',
            fgColor: '#ffffff',
            useColorArray: false,
            colorArray: folder(
                {
                    color1: { value: '#462255' },
                    color2: { value: '#313b72' },
                    color3: { value: '#62a87c' },
                    color4: { value: '#7ee081' },
                    color5: { value: '#c3f3c0' }
                },
                {
                    render: get => get('ASCIIEffect.useColorArray')
                }
            ),

            invert: false,
            useOriginalColors: true,
            brightness: 1,
            disabled: false
        }),
        ShaderControl: folder({
            offset: { label: 'Multiplier', value: 1, step: 0.01 }
        })
    });

    const collectedColors = Object.keys(guiConfig)
        .filter(key => /^color\d+$/.test(key))
        .map(key => guiConfig[key]);

    const Asciieffect = forwardRef(({ ...props }: IASCIIEffectProps, ref) => {
        const effect = useMemo(() => new ASCIIEffect({ ...props }), [props]);
        return <primitive object={effect} dispose={null} ref={ref} />;
    });

    return (
        <div>
            <Canvas
                style={{ width: 1280, height: 1280 }}
                camera={{
                    position: [-0, 0, 5],
                    fov: 85,
                    near: 0.1,
                    far: 100000
                }}
            >
                <Plane {...guiConfig} />

                <EffectComposer>
                    <Asciieffect {...guiConfig} colorArray={collectedColors} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}

export default App;
