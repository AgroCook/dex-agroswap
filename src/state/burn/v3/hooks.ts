import React, { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { usePool } from 'hooks/v3/usePools';
import { useActiveWeb3React } from 'hooks';
import { useToken } from 'hooks/v3/Tokens';
import { useCallback, useMemo } from 'react';
import { AppState } from '../../index';
import { selectPercent } from './actions';
import { unwrappedToken } from 'utils/unwrappedToken';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PositionPool } from '../../../models/interfaces';
import { Position } from 'v3lib/entities';
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees';

export function useBurnV3State(): AppState['burnV3'] {
  return useAppSelector((state) => state.burnV3);
}

export function useDerivedV3BurnInfo(
  position?: PositionPool,
  asWETH = false,
): {
  position?: Position;
  liquidityPercentage?: Percent;
  liquidityValue0?: CurrencyAmount<Currency>;
  liquidityValue1?: CurrencyAmount<Currency>;
  feeValue0?: CurrencyAmount<Currency>;
  feeValue1?: CurrencyAmount<Currency>;
  outOfRange: boolean;
  error?: string;
} {
  const { account } = useActiveWeb3React();
  const { percent } = useBurnV3State();

  const token0 = useToken(position?.token0);
  const token1 = useToken(position?.token1);

  const [, pool] = usePool(
    token0 ?? undefined,
    token1 ?? undefined,
    position?.fee,
    position?.isUni,
    position?.isV4,
  );

  const positionSDK = useMemo(
    () =>
      pool &&
      position?.liquidity &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
        ? new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          })
        : undefined,
    [pool, position],
  );

  const liquidityPercentage = new Percent(percent, 100);

  const discountedAmount0 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount0.quotient).quotient
    : undefined;
  const discountedAmount1 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount1.quotient).quotient
    : undefined;

  const liquidityValue0 =
    token0 && discountedAmount0
      ? CurrencyAmount.fromRawAmount(
          asWETH ? token0 : unwrappedToken(token0),
          discountedAmount0,
        )
      : undefined;
  const liquidityValue1 =
    token1 && discountedAmount1
      ? CurrencyAmount.fromRawAmount(
          asWETH ? token1 : unwrappedToken(token1),
          discountedAmount1,
        )
      : undefined;

  const [feeValue0, feeValue1] = useV3PositionFees(
    pool ?? undefined,
    position?.tokenId,
    asWETH,
  );

  const outOfRange =
    pool && position
      ? pool.tickCurrent < position.tickLower ||
        pool.tickCurrent > position.tickUpper
      : false;

  let error: string | undefined;
  if (!account) {
    error = `Connect Wallet`;
  }
  if (percent === 0) {
    error = error ?? `Enter a percent`;
  }
  return {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  };
}

export function useBurnV3ActionHandlers(): {
  onPercentSelect: (percent: number) => void;
} {
  const dispatch = useAppDispatch();

  const onPercentSelect = useCallback(
    (percent: number) => {
      dispatch(selectPercent({ percent }));
    },
    [dispatch],
  );

  return {
    onPercentSelect,
  };
}
