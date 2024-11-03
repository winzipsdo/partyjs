import { Dice } from '@/components/Dice/index';
import { useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import styles from './styles.module.css';
import { createStorageKey } from '@/constants/storage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

type DiceRoll = {
  id: number;
  timestamp: string;
  value: number;
};

export function DiceRollPage() {
  const [diceValue, setDiceValue] = useLocalStorageState(
    createStorageKey('dice-value'),
    {
      defaultValue: 6,
    }
  );
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useLocalStorageState<DiceRoll[]>(
    createStorageKey('dice-history'),
    {
      defaultValue: [],
    }
  );

  const columnHelper = createColumnHelper<DiceRoll>();
  const columns = [
    columnHelper.accessor('id', {
      header: 'Roll Count',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('timestamp', {
      header: 'Roll Time',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('value', {
      header: 'Roll Value',
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: rollHistory ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleClick = () => {
    if (isRolling) return;

    setIsRolling(true);

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setRollHistory((prev = []) => [
        {
          id: prev.length + 1,
          timestamp: new Date().toLocaleString(),
          value: newValue,
        },
        ...prev,
      ]);
      setIsRolling(false);
    }, 1200);
  };

  const handleReset = () => {
    setRollHistory([]);
  };

  return (
    <div>
      <div className={styles.content}>
        <div
          onClick={handleClick}
          style={{ cursor: isRolling ? 'default' : 'pointer' }}
          role="button"
          aria-label="Roll dice"
        >
          <Dice value={diceValue ?? 6} isRolling={isRolling} size={100} />
        </div>
        <div>
          <div className={styles.tableHeader}>
            <Button variant="destructive" onClick={handleReset}>
              重置历史记录
            </Button>
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
