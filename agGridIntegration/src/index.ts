import { Grid, GridOptions, ColDef } from "ag-grid/main";
import { LicenseManager } from "ag-grid-enterprise/main";
import  {License} from "../secret/license";

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";
import "powerbi-visuals-utils-formattingutils/lib/index.css";
import "../style/custom.css"
import DataView = powerbi.DataView;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
import DataViewMatrixNode = powerbi.DataViewMatrixNode;

export class SimpleGrid {
  private gridOptions: GridOptions = <GridOptions>{};
  private selectionManager: ISelectionManager;
  private host: IVisualHost;
  private dataView: DataView;
  constructor(
    eGridDiv: HTMLElement,
    dataView: DataView,
    selectionManager: ISelectionManager,
    host: IVisualHost,
    settings : any
  ) {
    this.dataView=dataView;
    this.selectionManager = selectionManager;
    this.host = host;
    this.gridOptions = this.constructGridOptions(dataView,settings);
   
    eGridDiv.setAttribute("class", "ag-theme-balham");
    LicenseManager.setLicenseKey( License.KEY);
    console.log(this.gridOptions);
    eGridDiv.innerHTML="";
    
    new Grid(eGridDiv, this.gridOptions);
    this.gridOptions.api.forEachNode((node)=>{
      if(node.group){
        node.setExpanded(true);
      }
    });
  }

  private constructGridOptions(dataView: DataView,settings): GridOptions {
    console.log(settings.tableSettings.enableSorting);
    let gridOptions: GridOptions = {
      columnDefs: this.createColumnDefs(dataView),
      rowData: this.createRowData(dataView),
      rowSelection: "single",
      onRowClicked: event => {
        if(!event.data || !event.data.selectionId){
          return;
        }
        this.selectionManager.select(event.data.selectionId, false).then(
          selectionIds => {
           // console.log(selectionIds);
          },
          reason => {
           // console.log(reason);
          }
        );
      },
      enableSorting: settings.tableSettings.enableSorting,
      enableFilter: settings.tableSettings.enableFiltering,
      groupMultiAutoColumn:true,
      groupSuppressAutoColumn: true
    };
    return gridOptions;
  }

  // specify the columns
  private createColumnDefs(dataView: DataView) {
    let columnDefs:any[]=[];
    let fieldIndex:number=0;
    let fieldIndexProperty = {
      fieldIndex:0
    };
    columnDefs = columnDefs.concat(this.setColumnHeadersWithRowData());
    this.setColumnHeaders(dataView.matrix.columns.root.children,columnDefs,fieldIndexProperty);
    return columnDefs;
  }

  private setColumnHeaders(dataViewMatrix:DataViewMatrixNode[],def,fieldIndexProperty:any){
    dataViewMatrix.forEach((child)=>{
        if(child.children){
            let childList = [];
            def.push({headerName:child.value,children:childList});
            this.setColumnHeaders(child.children,childList,fieldIndexProperty);
        }else{
          let headerName=child.value;
            if(!headerName){
              headerName=this.dataView.matrix.columns.levels[child.level].sources[child.levelSourceIndex|| 0].displayName
            }
            def.push({headerName:headerName,field:fieldIndexProperty.fieldIndex.toString(),valueFormatter:this.valueFormatter});
            fieldIndexProperty.fieldIndex++;
        }
    });
}
private valueFormatter = parameters => {
    if(!parameters.data || parameters.value==null){
      return parameters.value;
    }
    return parameters.data[parameters.colDef.field + "_formattedValue"]
      ? parameters.data[parameters.colDef.field + "_formattedValue"]
      : parameters.value;
  }

private setColumnHeadersWithRowData(){
  let colDefs=[];
  let lastLevelIndex=this.dataView.matrix.rows.levels.length-1;
  this.dataView.matrix.rows.levels.forEach((level,index)=>{
    if(lastLevelIndex==index){
      colDefs.push({headerName: level.sources[0].displayName,field:"source_"+index});
      return;
    }
    colDefs.push({headerName: level.sources[0].displayName,
                  showRowGroup:"source_"+index,
                  cellRenderer:'agGroupCellRenderer',
                  filterValueGetter: function(params) { return params.data ? params.data["source_"+index] : null; }});
    colDefs.push({field:"source_"+index,rowGroup: true, hide: true});
  });
  return colDefs;
}
  // specify the data
  private createRowData(dataView: DataView) {
    let rowData=[];
    this.setRowData(dataView.matrix.rows.root.children,rowData,{});
    console.log(rowData,"row");
    return rowData;
  }
  private setRowData(dataViewMatrix:DataViewMatrixNode[],def,parentValues){
    dataViewMatrix.forEach((child)=>{
        if(child.children){
           // let childList = [];
            //def.push({headerName:child.value,children:childList});
            if(child.level==0){
              parentValues = {};
            }
           // let values = {};
           parentValues["source_"+child.level] = child.levelValues[0].value;
            // def.push(values); 
            this.setRowData(child.children,def,parentValues);
        }else{
          
          let values = {...parentValues};
          values["source_"+child.level] = child.levelValues[0].value;
          
          Object.keys(child.values).forEach((key)=>{
            const valueFormatString=this.dataView.matrix.valueSources[child.values[key].valueSourceIndex || 0].format;
            if(valueFormatString){
              const iValueFormatter = valueFormatter.create({
                format: valueFormatString
              });
              values[key.toString()+"_formattedValue"]=iValueFormatter.format(child.values[key].value);
            }
          
            //console.log(key,child.values[key]);
            values[key.toString()] = child.values[key].value
          });
          def.push(values); 
        }
    });
}
}

