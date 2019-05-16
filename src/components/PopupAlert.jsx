import React from 'react';
import AssetCard2 from './Common/AssetCard2/AssetCard2';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: true,
        };
    }

    // componentWillMount() {
    //     this.timeout = setTimeout(() => this.tick(), 1000);
    // }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    // tick() {
    //     this.setState({ visible: !this.state.visible });
    //     this.timeout = setTimeout(() => this.tick(), 1000);
    // }

    render() {
        const { lastOperation } = this.props.d.history;
        const operationExists = lastOperation !== null;

        const operationInfo = {};
        if (operationExists) {
            switch (lastOperation.type) {
            case 'payment':
                operationInfo.amount = lastOperation.amount;
                operationInfo.code = lastOperation.asset_type === 'native' ? 'XLM' : lastOperation.asset_code;
                operationInfo.issuer = lastOperation.asset_issuer;
                break;
            default:
                break;
            }
        }
        // const popup = operationExists ? (
        //     <div className={`PopupAlert ${operationExists ? 'popup-show' : ''}`}>
        //         <div className="text">You recieved {operationInfo.amount}</div>
        //         <div className="text">
        //             <AssetCard2 code={operationInfo.code} issuer={operationInfo.issuer} />
        //         </div>
        //     </div>
        // ) : (
        //     <div className="PopupAlert">
        //         <div className="text">Stateless</div>
        //     </div>
        // );

        return (
            <div className={'PopupAlert popup-show'}>
                <div className="popup-title">Offer closed</div>
                <div className="popup-text">You BTC to XLM offer was closed</div>
                {/* <div className="text">
                    <AssetCard2 code={operationInfo.code} issuer={operationInfo.issuer} />
                </div> */}
            </div>
        );
    }
}
