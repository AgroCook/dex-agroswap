import { Interface, formatUnits } from 'ethers/lib/utils';
import { useContract, useDefiedgeStrategyContract } from 'hooks/useContract';
import { useEffect, useState } from 'react';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import PoolABI from 'constants/abis/v3/pool.json';
import { tickToPrice } from 'v3lib/utils';
import { BigNumber } from 'ethers';

export function useDefiedgeStrategyData(strategy: string) {
  const strategyContract = useDefiedgeStrategyContract(strategy);
  const totalSupplyResult = useSingleCallResult(
    strategyContract,
    'totalSupply',
  );

  const [amounts, setAmounts] = useState<{
    amount0: BigNumber;
    amount1: BigNumber;
  }>();

  strategyContract?.callStatic
    .getAUMWithFees(true)
    .then((data) => {
      setAmounts({
        amount0: BigNumber.from(data.amount0).add(
          BigNumber.from(data.totalFee0),
        ),
        amount1: BigNumber.from(data.amount1).add(
          BigNumber.from(data.totalFee1),
        ),
      });
    })
    .catch((e) => {
      console.warn(e);
    });

  return {
    totalSupply:
      totalSupplyResult.result &&
      Number(formatUnits(totalSupplyResult.result[0] ?? 0, 18)),
    amount0: amounts?.amount0,
    amount1: amounts?.amount1,
  };
}

function getRatio(p: number, pmin: number, pmax: number) {
  const sqp = Math.sqrt(p);
  return (sqp * (sqp - Math.sqrt(pmin))) / (1 - sqp / Math.sqrt(pmax));
}

export function useDefiedgeTicks(strategyAddress: string, poolAddress: string) {
  const strategyContract = useDefiedgeStrategyContract(strategyAddress);
  const poolContract = useContract(poolAddress, new Interface(PoolABI));

  const ticksResult = useSingleCallResult(strategyContract, 'ticks', [0]);
  const currentTickResult = useSingleCallResult(poolContract, 'globalState');

  const strategyTicksResult =
    !ticksResult.loading && ticksResult.result && ticksResult.result.length > 0
      ? ticksResult.result
      : undefined;

  const tickLower = strategyTicksResult ? strategyTicksResult[0] : undefined;
  const tickUpper = strategyTicksResult ? strategyTicksResult[1] : undefined;
  const currentTick =
    !currentTickResult.loading &&
    currentTickResult.result &&
    currentTickResult.result.length > 1 &&
    currentTickResult.result[1];

  const loading = ticksResult.loading || currentTickResult.loading;

  return {
    tickLower,
    tickUpper,
    currentTick,
    loading,
  };
}

export function useDefiedgeLiquidityRatio(
  strategyAddress: string,
  poolAddress: string,
  token0: any,
  token1: any,
) {
  const [ratio, setRatio] = useState<number | null>(null);

  const { tickLower, tickUpper, currentTick, loading } = useDefiedgeTicks(
    strategyAddress,
    poolAddress,
  );

  useEffect(() => {
    if (!loading && tickLower && tickUpper && currentTick) {
      const pa = +tickToPrice(token0, token1, tickLower).toSignificant(6);
      const pb = +tickToPrice(token0, token1, tickUpper).toSignificant(6);
      const cp = +tickToPrice(token0, token1, currentTick).toSignificant(6);

      setRatio(getRatio(cp, pa, pb));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    loading,
    ratio,
  };
}
