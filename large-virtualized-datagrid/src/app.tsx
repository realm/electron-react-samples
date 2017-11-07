import * as React from 'react';
import * as Realm from 'realm';
import * as faker from 'faker';
import { Column } from 'react-data-grid';
import * as ReactDataGrid from 'react-data-grid';

const ProductSchema: Realm.ObjectSchema = {
  primaryKey: 'productId',
  name: 'Product',
  properties: {
    productId: 'int',
    name: 'string',
    price: 'float'
  }
}

const myRealm = new Realm({
  schema: [ProductSchema]
})

if (myRealm.objects('Product').length == 0) {
  myRealm.write(() => {
    for (var index = 0; index < 1000000; index++) {
      myRealm.create('Product', {
        productId: index,
        name: faker.commerce.productName(),
        price: faker.random.number({ min: 0, max: 999 })
      }, true)
    }
  })
}

export class App extends React.Component<undefined, { cpu: number, mem: number }> {

  sortedProducts = myRealm.objects('Product').sorted('price')

  columns: Column[] = [
    { key: 'productId', name: 'ProductId' },
    { key: 'name', name: 'Name' },
    { key: 'price', name: 'Price' } 
  ];

  constructor(props: any){
    super(props)
    this.state = {
      cpu: process.getCPUUsage().percentCPUUsage,
      mem: process.getProcessMemoryInfo().workingSetSize
    }
  }

  rowGetter = (index: number) => {
    return this.sortedProducts[index]
  }

  render() {
    return (
      <div>
        <h2>There are {myRealm.objects('Product').length} Products </h2>
        <ReactDataGrid
          columns={this.columns}
          rowGetter={this.rowGetter}
          rowsCount={this.sortedProducts.length}
          minHeight={500} />
      </div>
    );
  }
}
