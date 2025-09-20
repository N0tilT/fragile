// src/utils/ymapsInit.ts
import { YMaps } from '@pbe/react-yandex-maps';

// Создаем промис для инициализации ymaps
let ymapsPromise: Promise<any> | null = null;

export const initYmaps = () => {
  if (!ymapsPromise) {
    ymapsPromise = new Promise((resolve) => {
      // Ждем, когда ymaps будет доступен глобально
      const checkYmaps = () => {
        if (typeof window !== 'undefined' && (window as any).ymaps) {
          resolve((window as any).ymaps);
          return;
        }
        setTimeout(checkYmaps, 100);
      };
      checkYmaps();
    });
  }
  return ymapsPromise;
};

// Вспомогательная функция для создания кастомных иконок
export const createCustomIconLayout = (ymaps: any, severity: string) => {
  return ymaps.templateLayoutFactory.createClass(
    `<div style="background-color: {{ options.iconColor }}; 
                 width: 40px; 
                 height: 40px;
                 border-radius: 50%;
                 border: 2px solid white;
                 box-shadow: 0 0 10px rgba(0,0,0,0.5);
                 cursor: pointer;
                 display: flex;
                 align-items: center;
                 justify-content: center;">
      <img src="/icons/${severity}-fire.png" alt="${severity}" style="width: 24px; height: 24px;" />
    </div>`,
    {
      build: function() {
        this.constructor.superclass.build.call(this);
        this._element = this.getParentElement().getElementsByTagName('div')[0];
      },
    }
  );
};