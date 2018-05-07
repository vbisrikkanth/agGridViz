
/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
module powerbi.extensibility.visual {
    "use strict";   

   
    export class VbiTable implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;
        private agGridIntegration : any;
        private selectionManager: ISelectionManager;
        private host: IVisualHost;
        private tableContainer:HTMLElement;
        private editorContainer: HTMLElement;
        private valueSources: DataViewMetadataColumn[];
        constructor(options: VisualConstructorOptions) {
            this.selectionManager = options.host.createSelectionManager();
            this.host=options.host;
            this.target = options.element;
            this.agGridIntegration = (<any>window).agGridIntegration;
            this.tableContainer =document.createElement("div");
            this.editorContainer = document.createElement("div");
            this.target.appendChild(this.editorContainer);
            this.target.appendChild(this.tableContainer);
        }

        public update(options: VisualUpdateOptions) {
            console.log(options.dataViews[0].matrix);
            this.settings = VbiTable.parseSettings(options && options.dataViews && options.dataViews[0]);
            if (options.editMode === EditMode.Advanced) {
                let dataView = options.dataViews[0];
                const editor =new AdvancedEditor(this.editorContainer,this.host,this.settings);
                editor.renderEditor();
                this.editorContainer.setAttribute("style","display:block;height:20%");
                this.tableContainer.setAttribute("style","height:80%");
            }
            else{
                this.editorContainer.setAttribute("style","display:none");
                this.tableContainer.setAttribute("style","height:100%");
            }

            this.valueSources =options.dataViews[0].matrix.valueSources;
            //let columns:DataViewMatrix.columns = options.dataViews[0].matrix.columns;
            new this.agGridIntegration.SimpleGrid(this.tableContainer,options.dataViews[0],this.selectionManager,this.host,this.settings);
                       
        }
        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            console.log(this.settings);
            let visualSettings= VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            
            if(objectName==="fieldFormatting"){
                this.valueSources.forEach((valueSource)=>{
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: valueSource.displayName,
                        properties:{
                            displayUnit: valueSource.objects &&  valueSource.objects.fieldFormatting ?  valueSource.objects.fieldFormatting.displayUnit :"none"
                        },
                        selector:this.host.createSelectionIdBuilder().withMeasure(valueSource.queryName).createSelectionId().getSelector()
                    });
                })
                console.log(objectEnumeration);
                return objectEnumeration;
            };
            
           
            return visualSettings;
        }
    }
}