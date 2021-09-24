/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */

Hooks.once('ready', function () {
    console.log('accidental-item-deletion-preventer | Initializing accidental-item-deletion-preventer');

    game.settings.register("accidental-item-deletion-preventer", "CheckDelete", {
        name: game.i18n.localize('PREVENTER.settings.name'),
        hint: game.i18n.localize('PREVENTER.settings.hint'),
        scope: "client",
        default: true,
        type: Boolean,
        config: true, 
    })

    Hooks.on("preDeleteItem", (item, render, ...args) => {
        if (game.settings.get("accidental-item-deletion-preventer", "CheckDelete") && item.parent) {
            let actor = item.parent;
            let itemId = item.id;

            let quantity = item.data.data.quantity;
            let text = `<p>${game.i18n.localize('PREVENTER.dialog-question')} <em>"${item.name}"</em> ?</p>`
            let deleteAmount = 1;
            if (item.toDelete) {
                return true;
            }

            if (quantity > 1) {
                text += `
				    <form class="row form-inline">
					    <div class="form-group">
					        <strong>${game.i18n.localize('PREVENTER.delete')}:</strong> <input id="deleteAmountID" type="number" value="${quantity}" style="margin-left: 10px" /> <span style="margin-left: 5px; margin-right:220px"> ${game.i18n.localize('PREVENTER.of')} ${quantity}</span>
					    </div>
				    </form>`
            }

            let d = new Dialog({
                // localize this text
                title: game.i18n.localize('PREVENTER.dialog-header'),
                content: text,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize('PREVENTER.confirm-button'),
                        callback: async (html) => {
                            if (quantity > 1) {
                                deleteAmount = parseInt(html.find("input#deleteAmountID").val());
                            }
                            if (deleteAmount >= quantity || quantity == undefined) {
                                item.toDelete = true;
                                actor.deleteEmbeddedDocuments("Item", [itemId]);
                            } else if (deleteAmount > 0) {
                                let new_quantity = quantity - deleteAmount;
                                await actor.updateEmbeddedDocuments("Item", [{ _id: itemId, id: itemId, "data.quantity": new_quantity }]);
                            } else {
                                return;
                            }
                        }
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize('PREVENTER.cancel-button'),
                        callback: () => { return false }
                    }
                },
                default: "one"
            });
            d.render(true);

            return false;
        }
    });

    Hooks.on("preDeleteActiveEffect", (effect, render, ...args) => {
        if (game.settings.get("accidental-item-deletion-preventer", "CheckDelete") && effect.parent) {
            let actor = effect.parent;
            let effectId = effect.id;
            if (effect.toDelete) {
                return true;
            }
            let d = new Dialog({
                // localize this text
                title: game.i18n.localize('PREVENTER.dialog-header'),
                content: `<p>${game.i18n.localize('PREVENTER.dialog-question')} <em>"${effect.data.label}"</em> ?</p>`,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize('PREVENTER.confirm-button'),
                        callback: () => {
                            effect.toDelete = true;
                            actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
                        }
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize('PREVENTER.cancel-button'),
                        callback: () => { }
                    }
                },
                default: "one"
            });
            d.render(true);

            return false;
        }

    });

}
);