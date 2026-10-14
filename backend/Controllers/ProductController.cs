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

    [HttpGet("GetProducts")]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _context.Products.ToListAsync();
        return Ok(products);
    }

    [HttpGet("ProductList")]
    public async Task<IActionResult> ProductList()
    {
        var products = await _context.Products
            .Select(p => new ProductDTO
            {
                PkProductId = p.PkProductId,
                DisplayId = p.DisplayId,
                Slug = p.Slug,
                ProductName = p.ProductName,
                FkCategoryId = p.FkCategoryId,
                BasePrice = p.BasePrice.ToString("F2"), // Format as string with 2 decimal places
                isActive = p.IsActive,
                ProductImages = p.ProductImages
                    .Where(img => img.IsPrimary) // Only include primary images
                    .Select(img => new ProductImageDTO
                    {
                        Url = img.Url,
                        AltText = img.AltText
                    })
                    .ToList()
            })
        .ToListAsync();
        return Ok(products);
    }

    [HttpGet("GetProductByID/{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null) return NotFound();
        
        return Ok(product);
    }

    [HttpPost("CreateProduct")]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        // PostgreSQL standardizes on UTC for timestamps
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        
        // Ensure new products default to active
        product.IsActive = true; 

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProductById), new { id = product.PkProductId }, product);
    }

    [HttpPut("UpdateProduct/{id}")]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product updatedProduct)
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

    // Handles the DELETE HTTP verb, but performs a soft delete
    [HttpDelete("DeactivateProduct/{id}")]
    public async Task<IActionResult> DeactivateProduct(string id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}