import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export function CrocodileDentistPixiPage() {
  const gameDomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const app = new PIXI.Application();
      await app.init({ background: '#1099bb', resizeTo: window });

      if (gameDomRef.current) {
        gameDomRef.current.appendChild(app.canvas);

        // 创建重新开始按钮
        const createRestartButton = () => {
          // 创建按钮容器
          const button = new PIXI.Container();

          // 创建按钮背景
          const background = new PIXI.Graphics();
          background.beginFill(0x4caf50);
          background.drawRoundedRect(0, 0, 200, 50, 10);
          background.endFill();

          // 创建按钮文字
          const text = new PIXI.Text('Play Again', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
          });
          text.anchor.set(0.5);
          text.x = 100;
          text.y = 25;

          // 组合按钮
          button.addChild(background);
          button.addChild(text);

          // 设置按钮位置
          button.x = app.screen.width / 2 - 100;
          button.y = app.screen.height / 2 + 100;

          // 添加交互
          button.eventMode = 'static';
          button.cursor = 'pointer';

          // 添加悬停效果
          button.on('pointerover', () => {
            background.tint = 0x388e3c;
          });

          button.on('pointerout', () => {
            background.tint = 0xffffff;
          });

          // 点击效果
          button.on('pointerdown', () => {
            background.tint = 0x1b5e20;
          });

          button.on('pointerup', () => {
            background.tint = 0xffffff;
            restartGame();
          });

          return button;
        };

        // 重新开始游戏函数
        const restartGame = () => {
          // 移除所有牙齿
          teethContainer.removeChildren();
          // 隐藏消息
          messageText.visible = false;
          // 隐藏重新开始按钮（不要移除）
          restartButton.visible = false;

          // 重新创建牙齿
          createTeeth();
        };

        // 创建牙齿的函数
        const createTeeth = () => {
          const teethPerRow = 6; // 每排6颗牙齿
          const toothWidth = 50;
          const toothHeight = 80;
          const spacing = 10;
          const rowSpacing = 100;

          // 随机选择一颗"坏牙"
          const badToothIndex = Math.floor(Math.random() * (teethPerRow * 2));

          // 创建上排牙齿
          for (let i = 0; i < teethPerRow; i++) {
            const tooth = new PIXI.Graphics();
            tooth.beginFill(0xffffff);
            tooth.lineStyle(2, 0x000000);
            tooth.drawRect(0, 0, toothWidth, toothHeight);
            tooth.endFill();

            tooth.x = i * (toothWidth + spacing);
            tooth.y = 0;

            tooth.eventMode = 'static';
            tooth.cursor = 'pointer';

            tooth.on('pointerdown', () => {
              if (i === badToothIndex) {
                tooth.tint = 0xff0000;
                showMessage('Ouch! Game Over!');
                endGame();
              } else {
                tooth.tint = 0x00ff00;
                tooth.eventMode = 'none';
                showMessage('Safe!');
              }
            });

            teethContainer.addChild(tooth);
          }

          // 创建下排牙齿
          for (let i = 0; i < teethPerRow; i++) {
            const tooth = new PIXI.Graphics();
            tooth.beginFill(0xffffff);
            tooth.lineStyle(2, 0x000000);
            tooth.drawRect(0, 0, toothWidth, toothHeight);
            tooth.endFill();

            tooth.x = i * (toothWidth + spacing);
            tooth.y = toothHeight + rowSpacing;

            tooth.eventMode = 'static';
            tooth.cursor = 'pointer';

            tooth.on('pointerdown', () => {
              if (i + teethPerRow === badToothIndex) {
                tooth.tint = 0xff0000;
                showMessage('Ouch! Game Over!');
                endGame();
              } else {
                tooth.tint = 0x00ff00;
                tooth.eventMode = 'none';
                showMessage('Safe!');
              }
            });

            teethContainer.addChild(tooth);
          }

          teethContainer.x =
            (app.screen.width - (toothWidth + spacing) * teethPerRow) / 2;
          teethContainer.y =
            (app.screen.height - (toothHeight * 2 + rowSpacing)) / 2;
        };

        // 创建文字提示
        const messageText = new PIXI.Text('', {
          fontFamily: 'Arial',
          fontSize: 48,
          fill: 0xff0000,
          align: 'center',
        });
        messageText.anchor.set(0.5);
        messageText.x = app.screen.width / 2;
        messageText.y = app.screen.height / 4;
        messageText.visible = false;
        app.stage.addChild(messageText);

        // 添加显示消息的函数
        const showMessage = (text: string, autoHide = true) => {
          messageText.text = text;
          messageText.visible = true;

          if (autoHide) {
            setTimeout(() => {
              messageText.visible = false;
            }, 2000);
          }
        };

        // 创建牙齿容器
        const teethContainer = new PIXI.Container();
        app.stage.addChild(teethContainer);

        // 创建重新开始按钮（初始不可见）
        const restartButton = createRestartButton();
        restartButton.visible = false;
        app.stage.addChild(restartButton);

        // 游戏结束函数
        const endGame = () => {
          teethContainer.children.forEach((tooth) => {
            tooth.eventMode = 'none';
          });
          showMessage('Game Over!', false);
          restartButton.visible = true;
        };

        // 初始化游戏
        createTeeth();
      }
    })();

    return () => {
      if (gameDomRef.current?.children[0]) {
        gameDomRef.current.removeChild(gameDomRef.current.children[0]);
      }
    };
  }, []);

  return <div ref={gameDomRef}></div>;
}
