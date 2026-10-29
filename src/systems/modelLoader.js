import { useGLTF as dreiUseGLTF } from '@react-three/drei';

dreiUseGLTF.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);

export const useGLTF = dreiUseGLTF;
