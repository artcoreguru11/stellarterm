import Event from '../Event';

export default function History(driver) {
    this.event = new Event();
    this.history = { records: [], details: {}, loadedRecords: null };
    this.loadMore = false;
    this.isLoading = false;
    this.loadLimit = 20;

    this.handlers = {
        loadHistory: (loadMore) => {
            this.loadMore = loadMore;
            if (this.loadMore === true && this.isLoading === false) {
                setTimeout(async () => {
                    await this.handlers.loadRecordsWithLimit(driver.Server, driver.session.account.account_id);
                }, 10);
            }
        },
        loadRecordsWithLimit: async (Server, publicKey) => {
            if (this.history.loadedRecords === null) {
                // First init loading
                this.history.loadedRecords = await Server.effects()
                    .forAccount(publicKey)
                    .limit(this.loadLimit)
                    .order('desc')
                    .call();
            } else if (this.loadMore && !this.isLoading) {
                this.history.loadedRecords = await this.history.loadedRecords.next();
            }

            if (this.history.loadedRecords.records.length !== 0 && !this.isLoading) {
                this.isLoading = true;
                this.history.records = this.history.records.concat(this.history.loadedRecords.records);
                this.handlers.loadRecordsWithLimit(Server, publicKey);
                this.event.trigger();
                this.handlers.getOperationDetails();
            }
        },
        getOperationDetails: async () => {
            let fetchTarget = null;
            for (let i = 0; i < this.history.records.length; i++) {
                const record = this.history.records[i];
                if (fetchTarget === null && this.history.details[record.id] === undefined) {
                    fetchTarget = i;
                } else {
                    this.isLoading = false;
                }
            }

            if (fetchTarget !== null) {
                this.isLoading = true;
                const record = this.history.records[fetchTarget];
                const operation = await record.operation();
                const transaction = await operation.transaction();
                record.category = record.type;
                this.history.details[record.id] = Object.assign(operation, transaction, record);
                this.handlers.getOperationDetails();
            } else {
                this.isLoading = false;
                if (this.loadMore && !this.isLoading) {
                    this.handlers.loadHistory(true);
                }
            }
            this.event.trigger();
        },
        listenNewTransactions: async (Server, publicKey) => {
            const newOperationCallback = async (res) => {
                const lastOperation = await Server.effects()
                    .forAccount(publicKey)
                    .limit(1)
                    .order('desc')
                    .call();

                if (lastOperation.records.length !== 0) {
                    this.history.records = lastOperation.records.concat(this.history.records);
                    this.handlers.getOperationDetails();
                }
            };

            Server.operations()
                .forAccount(publicKey)
                .cursor('now')
                .stream({
                    onmessage: newOperationCallback,
                });
        },
    };
}
