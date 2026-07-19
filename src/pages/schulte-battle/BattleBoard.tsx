import { memo } from 'react';
import { cn } from '@/lib/utils';
import styles from './styles.module.css';
import { FOUR_COLORS } from '../schulte-table/utils';
import type { BattlePhase, Player } from './useSchulteBattle';

interface Props {
  positions: number[];
  foundBy: Record<number, Player>;
  phase: BattlePhase;
  sabotage: { fourColor: boolean; rotate: boolean };
  wrong: number | null;
  onTap: (n: number) => void;
}

// 用 memo 隔离：生命条每帧刷新时，静态棋盘不重渲染（翻滚由 CSS 动画维持）
export const BattleBoard = memo(function BattleBoard({ positions, foundBy, phase, sabotage, wrong, onTap }: Props) {
  const revealed = phase === 'search';
  return (
    <div className={styles.grid}>
      {positions.map((n, i) => {
        const owner = foundBy[n];
        if (owner !== undefined) {
          // 已占领：显示归属方颜色 + 淡显数字
          return (
            <div key={i} className={cn(styles.cell, styles.claimed, owner === 0 ? styles.claimed0 : styles.claimed1)}>
              {n}
            </div>
          );
        }
        if (!revealed) {
          // 未揭晓：空白
          return <div key={i} className={cn(styles.cell, styles.hidden)} />;
        }
        // 揭晓、可点
        const color = sabotage.fourColor ? FOUR_COLORS[n % FOUR_COLORS.length] : undefined;
        const content = sabotage.rotate ? (
          <span
            className={styles.spin}
            style={{ ['--dur' as string]: `${2 + (n % 5) * 0.35}s`, ['--dir' as string]: n % 2 ? 'reverse' : 'normal' }}
          >
            {n}
          </span>
        ) : (
          n
        );
        return (
          <button
            key={i}
            onClick={() => onTap(n)}
            className={cn(styles.cell, styles.live, wrong === n && styles.wrong)}
            style={{ color }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
});
