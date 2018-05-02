import { Grid, GridOptions, ColDef } from "ag-grid/main";
// for ag-grid-enterprise users only
//import 'ag-grid-enterprise/main';

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";
import DataView = powerbi.DataView;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;

export class SimpleGrid {
  private gridOptions: GridOptions = <GridOptions>{};
  private selectionManager: ISelectionManager;
  private selectionIdBuilder: ISelectionIdBuilder;

  constructor(eGridDiv: HTMLElement, dataView: DataView,selectionManager:ISelectionManager, selectionIdBuilder: ISelectionIdBuilder) {
    this.selectionManager = selectionManager;
    this.selectionIdBuilder = selectionIdBuilder;
    this.gridOptions = this.constructGridOptions(dataView);
    eGridDiv.setAttribute("class", "ag-theme-balham");
    new Grid(eGridDiv, this.gridOptions);
  }

  private constructGridOptions(dataView: DataView): GridOptions {
    let gridOptions: GridOptions = {
      columnDefs: this.createColumnDefs(dataView),
      rowData: this.createRowData(dataView),
      rowSelection:"single",
      onRowClicked:(event) =>{
          console.log(event,"event");
          this.selectionManager.select(event.data.selectionId,false);
      }
    };
    return gridOptions;
  }

  // specify the columns
  private createColumnDefs(dataView: DataView) {
    let categories = dataView.categorical.categories.map((value, index) => {
      let colDef: ColDef = {
        headerName: value.source.displayName,
        field: value.source.displayName
      };
      return colDef;
    });

    let measures = dataView.categorical.values.map((value, index) => {
      let colDef: ColDef = {
        headerName: value.source.displayName,
        field: value.source.displayName
      };
      return colDef;
    });

    return categories.concat(measures);
  }

  // specify the data
  private createRowData(dataView: DataView) {
    let rowDefs = [];
    let totalRows = dataView.categorical.categories[0].values.length;
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      let rowDef = {};
      let selectionIdBuilder;
      //let selectionIdBuilder = this.selectionIdBuilder; 
      dataView.categorical.categories.forEach(categoryColumn => {
          
        //selectionIdBuilder= this.selectionIdBuilder.withCategory( categoryColumn,rowIndex);
        rowDef[categoryColumn.source.displayName] =
          categoryColumn.values[rowIndex];
      });
      dataView.categorical.values.forEach(measureColumn => {
        rowDef[measureColumn.source.displayName] =
          measureColumn.values[rowIndex];
      });
      selectionIdBuilder= this.selectionIdBuilder.withCategory( dataView.categorical.categories[0],1);
    //   rowDef["selectionId"]=this.selectionIdBuilder.withCategory(dataView.categorical.categories[0],1).withCategory(dataView.categorical.categories[1],1).createSelectionId();
      rowDef["selectionId"]=selectionIdBuilder.createSelectionId();
      rowDefs.push(rowDef);
     
    }
    return rowDefs;
  }
}
