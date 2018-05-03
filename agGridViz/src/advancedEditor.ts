module powerbi.extensibility.visual{

    export class AdvancedEditor{
        private editorContainer: HTMLElement;
        private host: IVisualHost;
        private settings :VisualSettings;

        constructor(editorContainer: HTMLElement,host: IVisualHost,settings :VisualSettings){
            this.editorContainer = editorContainer;
            this.host = host;
            this.settings = settings;

        }

        public renderEditor(){
            let formElements = [{
                propertyName:"enableSorting",
                sectionName:"tableSettings",
                label:"Toggle Sorting",
                type:"boolean"
            },{
                propertyName:"enableFiltering",
                sectionName:"tableSettings",
                label:"Toggle Filtering",
                type:"boolean"
            }
        ];
            this.editorContainer.innerHTML=`<h2> Welcome to table editor </h2>`;
            const $editorContainer = $(this.editorContainer);
            formElements.forEach(formElement=>{
                // switch (formElement.type){
                //     case "boolean":

                // }
                if(formElement.type === "boolean"){
                    const $label = $(`<label>${formElement.label}</label>`);
                    const $button= $("<input type='checkbox'></input>");
                    if(this.settings[formElement.sectionName][formElement.propertyName]){
                        $button.attr("checked","checked");
                    }else{
                        $button.removeAttr("checked");
                    }   

                    $button.click(()=>{
                        const properties: { [propertyName: string]: DataViewPropertyValue } = {};
                        properties[formElement.propertyName] = !this.settings[formElement.sectionName][formElement.propertyName];
                        const tableSettings: VisualObjectInstancesToPersist = {
                            merge: [
                                <VisualObjectInstance>{
                                    objectName: formElement.sectionName,
                                    selector: null,
                                    properties: properties
                                }]
                        };
                        //console.log(tableSettings);
                        this.host.persistProperties(tableSettings);
                    });
                    $editorContainer.append($label);
                    $editorContainer.append($button);
                }
            });
        }
    }
}