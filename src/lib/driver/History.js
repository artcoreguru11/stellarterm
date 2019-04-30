import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Event from '../Event';

export default function History(driver) {
    this.event = new Event();

    let loading = false;
    this.spoonHistory = null;
    this.lastOperation = null;

    // The way this history thing is that once the user touches the history tab,
    // they have permanently initiated history loading mode (and this is when
    // we start to eat through all the horizon history).

    // It's simple and reliable. this.handlers.touch is idempotent so it's fine
    // if it gets called many times
    this.handlers = {
        loadHistory: () => {
            const operationHandler = (operationResponse) => {
                console.log('-----------NEW TRANSACTION-----------');
                console.log(operationResponse);
                this.lastOperation = operationResponse;
            };

            const es = driver.Server.operations()
                .forAccount(driver.session.account.account_id)
                .cursor('now')
                .stream({
                    onmessage: operationHandler,
                });
            console.log('stream operation');

            if (loading === false) {
                loading = true;
                setTimeout(async () => {
                    this.spoonHistory = await MagicSpoon.History(
                        driver.Server,
                        driver.session.account.account_id,
                        () => {
                            console.log('checking history');

                            this.event.trigger();
                        },
                    );
                }, 10);
            }
        },
    };
}
