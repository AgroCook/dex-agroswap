import React from 'react';
import { Flex } from '@radix-ui/themes';
import './Layout.css';
import { AdvancedChart } from 'react-tradingview-embed';
import { OrderbookV2 } from './OrderbookV2';

export const Layout = () => {
  return (
    <div className='container'>
      <div className='graph'>
        <AdvancedChart widgetProps={{ height: '481' }} />
      </div>
      <div className='orderbook-other-wrapper'>
        <div className='orderbook'>
          <OrderbookV2 />
        </div>
        <div className='other'>OrderEntry</div>
      </div>
    </div>
  );
};
