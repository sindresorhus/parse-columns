import {expectType} from 'tsd';
import parseColumns = require('.');

expectType<Array<{[key: string]: string}>>(parseColumns('foo'));
expectType<Array<{[key: string]: string}>>(
	parseColumns('foo', {separator: ' '})
);
expectType<Array<{[key: string]: string}>>(
	parseColumns('foo', {headers: ['foo', 'bar']})
);
expectType<{[key: string]: string | number}[]>(
	parseColumns('foo', {
		transform(element, header, columnIndex, rowIndex) {
			expectType<string>(element);
			expectType<string>(header);
			expectType<number>(columnIndex);
			expectType<number>(rowIndex);

			if (columnIndex >= 1 && columnIndex <= 3) {
				return Number(element);
			}

			return element;
		}
	})
);
