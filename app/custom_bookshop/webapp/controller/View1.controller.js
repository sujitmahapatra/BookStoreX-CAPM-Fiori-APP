sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("custombookshop.controller.View1", {
        onInit() {
        },

        submit: function () {
            var title = this.getView().byId("title").getValue();
            var author = this.getView().byId("author").getValue();
            var price = this.getView().byId("price").getValue();
            var stock = this.getView().byId("stock").getValue();
            var location = this.getView().byId("location").getValue();
            var genre = this.getView().byId("genre").getValue();

            var oModel = this.getView().getModel();

            // alert(title+" "+author+" "+price+" "+stock+" "+location+" "+ genre);

            var oContext = oModel.bindList("/Books").create({
                "title": title,
                "author": author,
                "price": price,
                "stock": stock,
                "location": location,
                "genre": genre
            });
            oContext.created().then(() => {
                MessageBox.success("Book Added Successfully!");
                this.getView().byId("title").setValue(null);
                this.getView().byId("author").setValue(null);
                this.getView().byId("price").setValue(null);
                this.getView().byId("stock").setValue(null);
                this.getView().byId("location").setValue(null);
                this.getView().byId("genre").setValue(null);

            }).catch((err) => {
                MessageBox.error("Error while adding Books!");
                console.error("Error adding book : ", err);
            });
        },

        onCollapseExpandPress() {
            const oSideNavigation = this.byId("sideNavigation"),
                bExpanded = oSideNavigation.getExpanded();

            oSideNavigation.setExpanded(!bExpanded);
        },

        onAddBookPressed() {
            this.hideAllPanels();
            var OPanel = this.byId("Panel1");
            OPanel.setVisible(true);
        },

        onViewDetailsBookPressed() {
            this.hideAllPanels();
            var OPanel = this.byId("Panel2");
            OPanel.setVisible(true);
        },
        onEditBookPressed() {
            this.hideAllPanels();
            var OPanel = this.byId("Panel3");
            OPanel.setVisible(true);
        },
        
        onHomePressed() {
            this.hideAllPanels();
            var OPanel = this.byId("Panel4");
            OPanel.setVisible(true);
        },

        hideAllPanels() {
            this.byId("Panel1").setVisible(false);
            this.byId("Panel2").setVisible(false);
            this.byId("Panel3").setVisible(false);
            this.byId("Panel4").setVisible(false);
        },
        
        onActionPressed: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            this._oSelectedContext = oContext;

            if (!this._oActionSheet) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "custombookshop.view.ActionSheet",
                    controller: this
                }).then(function (oActionSheet) {
                    this._oActionSheet = oActionSheet;
                    this.getView().addDependent(this._oActionSheet);
                    this._oActionSheet.openBy(oButton);
                }.bind(this));
            }
            else {
                this._oActionSheet.openBy(oButton);
            }
        },
        onDeletePress: function () {
            var oContext = this._oSelectedContext;
            var sBookId = oContext.getProperty("ID");
            MessageBox.confirm("Are you sure!!! you want to delete the book with ID: " + sBookId + "?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        // code to delete the book using sBookId
                        oContext.delete("$direct").then(function () {
                            MessageBox.success("Book ID : " + sBookId + "deleted successfully.");
                        }).catch(function (oError) {
                            MessageBox.error("Error deleting book ID : " + sBookId + "." + oError + "Please try again later.");
                        });
                    }
                }
            })
        },

        onEditPress: function(){
            var oData = this._oSelectedContext.getObject();
            MessageToast.show("Edit action for Item ID: " + oData.ID);

            this.onEditBookPressed();
            var product_model = this.getOwnerComponent().getModel();
            let aFilters = [
                new Filter("ID", FilterOperator.EQ , oData.ID)
            ];

            let oBinding = product_model.bindList("/Books");
            oBinding.filter(aFilters);

            oBinding.requestContexts().then((aContexts) => {

                if(aContexts.length > 0 ) {
                    aContexts.forEach((oContext) => {
                        let oUser = oContext.getObject();
                        this.getView().byId("titleUpdate").setValue(oUser.title);
                        this.getView().byId("authorUpdate").setValue(oUser.author);
                        this.getView().byId("priceUpdate").setValue(oUser.price);
                        this.getView().byId("stockUpdate").setValue(oUser.stock);
                        this.getView().byId("locationUpdate").setValue(oUser.location);
                        this.getView().byId("genreUpdate").setValue(oUser.genre);
                        this.getView().byId("itemCode").setValue(oUser.ID);
                    });
                }
                else{
                    MessageBox.error("No book found with the specified ID.");
                }
            }).catch((oError) => {
                MessageBox.error("Error retrieving book details: " + oError);
            })
        },

        updateItem: function(){
            var itemCode = this.getView().byId("itemCode").getValue();
            var title = this.getView().byId("titleUpdate").getValue();
            var author = this.getView().byId("authorUpdate").getValue();
            var price = this.getView().byId("priceUpdate").getValue();
            var stock = this.getView().byId("stockUpdate").getValue();
            var location = this.getView().byId("locationUpdate").getValue();
            var genre = this.getView().byId("genreUpdate").getValue();

            var update_oModel = this.getView().getModel();
            var sPath = "/Books('"+itemCode+"')";
            var oContext = update_oModel.bindContext(sPath).getBoundContext();

            var oView = this.getView();
            function resetBusy(){
                oView.setBusy(false);
            }
            oView.setBusy(true);

            oContext.setProperty("title",title);
            oContext.setProperty("author",author);
            oContext.setProperty("price",price);
            oContext.setProperty("stock",stock);
            oContext.setProperty("location",location);
            oContext.setProperty("genre",genre);

            update_oModel.submitBatch("auto").then(function(){
                resetBusy();
                MessageBox.success("Item details update successfully");
            }).catch(function(err){
                resetBusy();
                MessageBox.error("An error occured while updating an Item: " + err);
            })
        }
    });
});