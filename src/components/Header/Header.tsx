import React from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { addMaticToMetamask } from 'utils';
import { WalletModal } from 'components';
import QuickLogo from 'assets/images/quickLogo.svg';
import { ReactComponent as PolygonIcon } from 'assets/images/Currency/Polygon.svg';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  header: {
    padding: '0 40px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'space-between',
    '& a': {
      display: 'flex'
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      zIndex: 2,
      '&:last-child': {
        '& button': {
          height: 40,
          borderRadius: 20,
          '&:first-child': {
            padding: '0 16px',
            marginRight: 16,
            '& svg': {
              width: 20,
              height: 20,
              marginRight: 8
            }
          },
          '&:last-child': {
            padding: '0 32px'
          },
          '& p': {
            fontSize: 16
          }
        }
      }
    }
  },
  networkWrapper: {
    marginLeft: 16,
    padding: '0 12px',
    height: 26,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    background: palette.primary.dark,
    '& p': {
      marginLeft: 6,
      textTransform: 'uppercase',
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.87)'
    }
  },
  mainMenu: {
    display: 'flex',
    alignItems: 'center',
    '& a': {
      textDecoration: 'none',
      color: 'white',
      marginRight: 20,
      '&:last-child': {
        marginRight: 0
      }
    },
    [breakpoints.down('sm')]: {
      display: 'none !important'
    }
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();
  const { account, connector, error } = useWeb3React();
  const { ethereum } = (window as any);
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const toggleWalletModal = useWalletModalToggle();
  const menuItems = [
    {
      link: '/',
      text: 'EXCHANGE'
    },
    {
      link: '/',
      text: 'Rewards',
    },
    {
      link: '/',
      text: 'ANALYTICS',
    },
    {
      link: '/',
      text: 'DEVELOPERS',
    },
    {
      link: '/',
      text: 'IDO',
    },
    {
      link: '/',
      text: 'ABOUT'
    }
  ]

  return (
    <Box className={classes.header}>
      <Box>
        <Link to='/'>
          <img src={QuickLogo} alt='QuickLogo' />
        </Link>
        <Box className={classes.networkWrapper}>
          <PolygonIcon />
          <Typography>Polygon</Typography>
        </Box>
      </Box>
      <Box className={classes.mainMenu}>
        {
          menuItems.map((val, index) => (
            <Link to={val.link} key={index}>
              <Typography>{ val.text }</Typography>
            </Link>
          ))
        }
      </Box>
      <Box>
        <Button variant='contained' color='secondary'>
          <QuickIcon />
          <Typography>Buy Quick</Typography>
        </Button>
        <Button color='primary' onClick={() => { isnotMatic ? addMaticToMetamask() : toggleWalletModal() }}>
          <Typography>{ isnotMatic ? 'Switch to Matic' : 'Connect' }</Typography>
        </Button>
      </Box>
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </Box>
  );
};

export default Header;
