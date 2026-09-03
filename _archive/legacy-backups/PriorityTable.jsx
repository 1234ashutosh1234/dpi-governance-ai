function PriorityTable({
  categories,
}) {
  return (
    <div className="panel">

      <h2>
        Development Demand
      </h2>

      <div className="table-wrapper">

        <table>

          <thead>
            <tr>
              <th>Category</th>
              <th>Requests</th>
              <th>Demand %</th>
            </tr>
          </thead>

          <tbody>

            {categories.map(
              (item, index) => (

                <tr key={index}>

                  <td>
                    {item.category}
                  </td>

                  <td>
                    {item.requests}
                  </td>

                  <td>
                    {item.percentage}%
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default PriorityTable;
