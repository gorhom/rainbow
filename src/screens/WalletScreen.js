import { withSafeTimeout } from '@hocs/safe-timers';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { withNavigation, withNavigationFocus } from 'react-navigation';
import {
  compose,
  onlyUpdateForKeys,
  withHandlers,
  withProps,
  withState,
} from 'recompact';
import { AssetList } from '../components/asset-list';
import BlurOverlay from '../components/BlurOverlay';
import { FabWrapper } from '../components/fab';
import { CameraHeaderButton, Header, ProfileHeaderButton } from '../components/header';
import { Page } from '../components/layout';
import buildWalletSectionsSelector from '../helpers/buildWalletSections';
import { getShowShitcoinsSetting, updateShowShitcoinsSetting } from '../model/localstorage';
import {
  withAccountData,
  withAccountSettings,
  withBlurTransitionProps,
  withDataInit,
  withHideSplashScreen,
  withIsWalletEmpty,
  withUniqueTokens,
} from '../hoc';
import { position } from '../styles';
import withStatusBarStyle from '../hoc/withStatusBarStyle';

class WalletScreen extends PureComponent {
  static propTypes = {
    allAssetsCount: PropTypes.number,
    assets: PropTypes.array,
    assetsTotal: PropTypes.object,
    blurOpacity: PropTypes.object,
    isEmpty: PropTypes.bool.isRequired,
    isFocused: PropTypes.bool,
    navigation: PropTypes.object,
    onHideSplashScreen: PropTypes.func,
    refreshAccountData: PropTypes.func,
    sections: PropTypes.array,
    setSafeTimeout: PropTypes.func,
    showBlur: PropTypes.bool,
    toggleShowShitcoins: PropTypes.func,
    uniqueTokens: PropTypes.array,
  }

  componentDidMount = async () => {
    try {
      const showShitcoins = await getShowShitcoinsSetting();
      if (showShitcoins !== null) {
        this.props.toggleShowShitcoins(showShitcoins);
      }
    } catch (error) {
      // TODO
    }
  }

  shouldComponentUpdate = () => {
    return this.props.isFocused;
  };

  hideSpashScreen = () => {
    const { onHideSplashScreen, setSafeTimeout } = this.props;
    setSafeTimeout(onHideSplashScreen, 150);
  }

  render = () => {
    const {
      blurOpacity,
      isEmpty,
      navigation,
      refreshAccountData,
      sections,
      showBlur,
    } = this.props;

    return (
      <Page style={{ flex: 1, ...position.sizeAsObject('100%') }}>
        <Header justify="space-between">
          <ProfileHeaderButton navigation={navigation} />
          <CameraHeaderButton navigation={navigation} />
        </Header>
        <FabWrapper disabled={isEmpty}>
          <AssetList
            fetchData={refreshAccountData}
            isEmpty={isEmpty}
            onLayout={this.hideSpashScreen}
            sections={sections}
          />
        </FabWrapper>
        {showBlur && <BlurOverlay opacity={blurOpacity} />}
      </Page>
    );
  }
}

export default compose(
  withAccountData,
  withUniqueTokens,
  withAccountSettings,
  withDataInit,
  withHideSplashScreen,
  withSafeTimeout,
  withNavigation,
  withNavigationFocus,
  withBlurTransitionProps,
  withIsWalletEmpty,
  withStatusBarStyle('dark-content'),
  withState('showShitcoins', 'toggleShowShitcoins', true),
  withHandlers({
    onToggleShowShitcoins: ({ showShitcoins, toggleShowShitcoins }) => (index) => {
      if (index === 0) {
        const updatedShowShitcoinsSetting = !showShitcoins;
        toggleShowShitcoins(updatedShowShitcoinsSetting);
        updateShowShitcoinsSetting(updatedShowShitcoinsSetting);
      }
    },
  }),
  withProps(buildWalletSectionsSelector),
)(WalletScreen);
