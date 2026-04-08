import useFinanceStore from '../store/financeStore';

const FinanceCard = ({ finance, onEdit }) => {
  const { deleteFinance } = useFinanceStore();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-800">{finance.category}</h3>
        <span className={`text-sm font-bold ${finance.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
          {finance.type === 'income' ? '+' : '-'}₹{finance.amount}
        </span>
      </div>
      {finance.description && <p className="text-sm text-gray-500">{finance.description}</p>}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-400">{finance.date}</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(finance)} className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
            Edit
          </button>
          <button onClick={() => deleteFinance(finance.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;