using backend.Data;
using backend.Models;
using backend.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        try
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET PRODUCTS CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("GetProducts")]
    public Task<IActionResult> GetProductsLegacy() => GetProducts();

    [HttpGet("ProductList")]
    public async Task<IActionResult> GetProductList()
    {
        try
        {
            var products = await _context.Products
                .Where(p => p.IsActive)
                .Select(p => new ProductListDTO
                {
                    Id = p.PkProductId,
                    Name = p.ProductName ?? string.Empty,
                    Price = p.BasePrice,
                    ImageSrc = p.ProductImages
                        .Where(img => img.IsPrimary)
                        .Select(img => img.Url)
                        .FirstOrDefault() ?? "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%237a7a7a'/></svg>",
                    Categories = p.FkCategoryId != null ? new List<string> { p.FkCategoryId } : new List<string>()
                })
                .ToListAsync();

            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.PkProductId == id);

            if (product == null) return NotFound();

            var detail = new ProductDetailDTO
            {
                Id = product.PkProductId,
                Name = product.ProductName ?? string.Empty,
                Description = product.Description ?? string.Empty,
                Price = product.BasePrice,
                ImageSrc = product.ProductImages?.FirstOrDefault(img => img.IsPrimary)?.Url 
                           ?? product.ProductImages?.FirstOrDefault()?.Url 
                           ?? "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='710' height='981'><rect width='710' height='981' fill='%237a7a7a'/></svg>",
                Stock = 10,
                Colors = new List<ColorDTO>
                {
                    new("Standard", "#000000")
                },
                Sizes = new List<SizeDTO>
                {
                    new("S", true), new("M", true), new("L", true), new("XL", true)
                }
            };

            return Ok(detail);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message });
        }
    }

    [HttpGet("GetProductByID/{id}")]
    public Task<IActionResult> GetProductByIdLegacy(string id) => GetProductById(id);

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            var product = new Product
            {
                DisplayId = request.DisplayId,
                Slug = request.Slug,
                ProductName = request.ProductName,
                FkCategoryId = request.FkCategoryId,
                Description = request.Description,
                BasePrice = request.BasePrice,
                Material = request.Material,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProductById), new { id = product.PkProductId }, product);
        }
        catch (DbUpdateException dbEx)
        {
            var dbError = dbEx.InnerException?.Message ?? dbEx.Message;
            Console.WriteLine($"=== CREATE PRODUCT DB CRASH ===\n{dbEx}");
            return StatusCode(500, new { error = "DatabaseUpdateFailed", details = dbError, stackTrace = dbEx.ToString() });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost("CreateProduct")]
    public Task<IActionResult> CreateProductLegacy([FromBody] CreateProductRequest request) => CreateProduct(request);

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product updatedProduct)
    {
        try
        {
            if (id != updatedProduct.PkProductId) return BadRequest("Product ID mismatch.");

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null) return NotFound();

            existingProduct.DisplayId = updatedProduct.DisplayId;
            existingProduct.Slug = updatedProduct.Slug;
            existingProduct.ProductName = updatedProduct.ProductName;
            existingProduct.FkCategoryId = updatedProduct.FkCategoryId;
            existingProduct.Description = updatedProduct.Description;
            existingProduct.BasePrice = updatedProduct.BasePrice;
            existingProduct.Material = updatedProduct.Material;
            existingProduct.IsActive = updatedProduct.IsActive;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException dbEx)
        {
            var dbError = dbEx.InnerException?.Message ?? dbEx.Message;
            Console.WriteLine($"=== UPDATE PRODUCT DB CRASH ===\n{dbEx}");
            return StatusCode(500, new { error = "DatabaseUpdateFailed", details = dbError, stackTrace = dbEx.ToString() });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("UpdateProduct/{id}")]
    public Task<IActionResult> UpdateProductLegacy(string id, [FromBody] Product updatedProduct) => UpdateProduct(id, updatedProduct);

    [HttpDelete("{id}/deactivate")]
    public async Task<IActionResult> DeactivateProduct(string id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DEACTIVATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("DeactivateProduct/{id}")]
    public Task<IActionResult> DeactivateProductLegacy(string id) => DeactivateProduct(id);
}