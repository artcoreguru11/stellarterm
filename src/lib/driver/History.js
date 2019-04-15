import MagicSpoon from '../MagicSpoon';
import Event from '../Event';

export default function History(driver) {
    this.event = new Event();
    this.spoonHistory = null;
    let isLoading = false;

    // The way this history thing is that once the user touches the history tab,
    // they have permanently initiated history loading mode (and this is when
    // we start to eat through all the horizon history).

    // It's simple and reliable. this.handlers.touch is idempotent so it's fine
    // if it gets called many times

    this.handlers = {
        touch: () => {
            if (isLoading === false) {
                isLoading = true;

                setTimeout(async () => {
                    this.spoonHistory = await MagicSpoon.History(
                        driver.Server,
                        driver.session.account.account_id,
                        () => { this.event.trigger(); },
                    );
                }, 10);
            }
        },
    };
}
